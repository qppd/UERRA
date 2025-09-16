


import React, { useEffect, useState, useRef } from 'react';
import { loadUnisanBarangays } from '../assets/geojson';
import { parseLocation } from '../utils/locationUtils';

// ErrorBoundary for catching map errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log errorInfo here
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color:'red',padding:'1em'}}>Map failed to load: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}
import { Typography, Box, IconButton } from '@mui/material';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1Ijoic2FqZWRobSIsImEiOiJjbWUwZTI2bmUwMzRmMmtzOTV3aHIzb3pwIn0.vmkwo0fWsqc9-rJhYRb_2g'; // Fallback to hardcoded token
const MAP_CENTER = [121.99, 13.86]; // [lng, lat] for Unisan municipality center

// Unisan municipality bounds - restrict map movement to this area
const UNISAN_BOUNDS = [
  [121.93, 13.80], // Southwest corner [lng, lat]
  [122.06, 13.93]  // Northeast corner [lng, lat]
];

// Status to color mapping
const STATUS_COLORS = {
  'pending': '#ef4444',        // Red - Not Yet Under Control
  'acknowledged': '#f97316',   // Orange - Responding  
  'in_progress': '#eab308',    // Yellow - Contained
  'resolved': '#22c55e',       // Green - Safe
  'cancelled': '#6b7280'       // Gray - Other
};

// Sample pins removed - now using real data from database

// Function to decode PostGIS binary point data
const decodePostGISPoint = (binaryData) => {
  if (!binaryData) return null;
  
  try {
    // Handle if it's already an object with coordinates
    if (typeof binaryData === 'object' && binaryData.coordinates) {
      return binaryData.coordinates;
    }
    
    // If it's a string representation, try to parse it
    if (typeof binaryData === 'string') {
      // Check if it's the WKB hex format like the one you provided
      if (binaryData.match(/^[0-9A-Fa-f]+$/)) {
        // This is a hexadecimal WKB (Well-Known Binary)
        // For the value you provided: 0101000020E6100000C70A2362EF6A5E400FC4680C29F52B40
        
        // Parse basic structure:
        // First 8 chars (01010000): Geometry type and endianness
        // Next 8 chars (20E61000): SRID (4326 in little endian)
        // Next 16 chars: X coordinate in little endian double
        // Next 16 chars: Y coordinate in little endian double
        
        if (binaryData.length >= 42) { // Minimum length for POINT with SRID
          // Skip the first 18 characters (geometry type + SRID)
          const coordsHex = binaryData.slice(18);
          
          if (coordsHex.length >= 32) { // 16 chars each for X and Y
            const xHex = coordsHex.slice(0, 16);
            const yHex = coordsHex.slice(16, 32);
            
            // Convert from little endian hex to float64
            const x = hexToFloat64LE(xHex);
            const y = hexToFloat64LE(yHex);
            
            if (!isNaN(x) && !isNaN(y)) {
              return [x, y]; // [longitude, latitude]
            }
          }
        }
      }
      
      // Try parsing as POINT(x y) format
      const pointMatch = binaryData.match(/POINT\(([^)]+)\)/);
      if (pointMatch) {
        const [x, y] = pointMatch[1].split(' ').map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          return [x, y];
        }
      }
    }
  } catch (error) {
    console.error('Error decoding PostGIS point:', error);
  }
  
  return null;
};

// Helper function to convert little endian hex to float64
const hexToFloat64LE = (hex) => {
  // Reverse the byte order for little endian
  const bytes = [];
  for (let i = hex.length - 2; i >= 0; i -= 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  
  // Create ArrayBuffer and DataView
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  
  // Set bytes
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[i] || 0);
  }
  
  // Read as float64
  return view.getFloat64(0, false); // false = big endian (since we already reversed)
};

// Custom marker component
const StatusMarker = ({ status, onClick }) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.cancelled;
  
  return (
    <div
      onClick={onClick}
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.2s ease',
        position: 'relative',
        '@media (min-width: 768px)': {
          width: '24px',
          height: '24px',
          border: '3px solid white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translate(-50%, -50%) scale(1.2)';
        e.target.style.zIndex = '1000';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translate(-50%, -50%) scale(1)';
        e.target.style.zIndex = 'auto';
      }}
      onTouchStart={(e) => {
        e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
      }}
      onTouchEnd={(e) => {
        e.target.style.transform = 'translate(-50%, -50%) scale(1)';
      }}
    />
  );
};

const MapWidget = () => {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [geojsonData, setGeojsonData] = useState(null);
  const [isLoadingGeoJSON, setIsLoadingGeoJSON] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Fetch reports and try to get coordinates using PostGIS functions
        const { data: reports, error } = await supabase
          .rpc('get_reports_with_coordinates');

        if (error) {
          console.error('Error fetching reports:', error);
          // Fallback to direct table query if RPC function doesn't exist
          const { data: fallbackReports, error: fallbackError } = await supabase
            .from('reports')
            .select(`
              id, 
              description, 
              location,
              status, 
              created_at,
              priority,
              categories:category_id (
                id,
                name,
                color
              )
            `)
            .not('location', 'is', null)
            .order('created_at', { ascending: false });
          
          if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            setAllReports([]);
            return;
          }
          
          console.log('Using fallback query, raw reports data:', fallbackReports);
          
          // Process fallback data with binary decoder
          const reportsWithCoords = [];
          for (const report of fallbackReports || []) {
            try {
              const coords = decodePostGISPoint(report.location);
              if (coords) {
                reportsWithCoords.push({
                  id: report.id,
                  description: report.description,
                  status: report.status,
                  created_at: report.created_at,
                  priority: report.priority,
                  longitude: coords[0],
                  latitude: coords[1],
                  category_name: report.categories?.name,
                  category_color: report.categories?.color,
                  category_id: report.categories?.id
                });
              }
            } catch (coordErr) {
              console.error('Error processing coordinates for report', report.id, coordErr);
            }
          }
          
          setAllReports(reportsWithCoords);
          return;
        }

        console.log('RPC function returned:', reports);
        setAllReports(reports || []);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        setAllReports([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    const loadGeoJSONData = async () => {
      try {
        setIsLoadingGeoJSON(true);
        const data = await loadUnisanBarangays();
        setGeojsonData(data);
      } catch (error) {
        console.error('Failed to load GeoJSON data:', error);
      } finally {
        setIsLoadingGeoJSON(false);
      }
    };
    loadGeoJSONData();
  }, []);

  // Handle window resize for map responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.resize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Convert reports to map pins
  const mapPins = allReports.map(report => {
    // Check if coordinates are already available as separate fields (from RPC function)
    if (report.longitude !== undefined && report.latitude !== undefined) {
      return {
        id: report.id,
        longitude: report.longitude,
        latitude: report.latitude,
        status: report.status,
        category: report.category_name || 'Unknown',
        description: report.description,
        priority: report.priority,
        created_at: report.created_at,
        categoryColor: report.category_color,
        isReal: true
      };
    }
    
    // Fallback to parsing location field (if using direct table query)
    const coords = parseLocation(report.location);
    if (!coords) return null;
    
    return {
      id: report.id,
      longitude: coords[0],
      latitude: coords[1],
      status: report.status,
      category: report.categories?.name || 'Unknown',
      description: report.description,
      priority: report.priority,
      created_at: report.created_at,
      categoryColor: report.categories?.color,
      isReal: true
    };
  }).filter(Boolean);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Trigger map resize after fullscreen toggle
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 100);
  };

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'undefined' || MAPBOX_TOKEN === 'no-token') {
    return (
      <Box sx={{ width: '100%', height: '100%' }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary.main">
          Live Incident Map
        </Typography>
        <Box 
          sx={{ 
            width: '100%', 
            height: 'calc(100% - 60px)', 
            borderRadius: 3,
            bgcolor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'error.contrastText'
          }}
        >
          <Typography>Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your .env file.</Typography>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: '100%' }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary.main">
          Live Incident Map
        </Typography>
        <Box 
          sx={{ 
            width: '100%', 
            height: 'calc(100% - 60px)', 
            borderRadius: 3,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography>Loading reports...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ 
        ...(isFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          backgroundColor: 'background.paper'
        } : {
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          overflow: 'hidden'
        })
      }}
      className="full-width-map"
      >
        {!isFullscreen && (
          <Typography 
            variant="h6" 
            fontWeight={600} 
            mb={2} 
            color="primary.main"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Live Incident Map
          </Typography>
        )}
        
        <Box sx={{ 
          width: '100%', 
          height: isFullscreen ? '100vh' : 'calc(100% - 60px)',
          minHeight: isFullscreen ? '100vh' : { xs: '300px', sm: '350px', md: '400px' },
          borderRadius: isFullscreen ? 0 : { xs: 2, sm: 3 },
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#1a1a1a',
          boxShadow: isFullscreen ? 'none' : (theme => theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.6)' 
            : '0 8px 32px rgba(0,0,0,0.15)'),
          border: isFullscreen ? 'none' : (theme => theme.palette.mode === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.1)')
        }}
        className="map-container"
        >
          {/* Fullscreen Toggle Button */}
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
            size="small"
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <Map
            ref={mapRef}
            initialViewState={{ 
              longitude: MAP_CENTER[0], 
              latitude: MAP_CENTER[1], 
              zoom: 14
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/basic-v9"
            mapboxAccessToken={MAPBOX_TOKEN}
            maxBounds={UNISAN_BOUNDS}
            getCursor={() => 'grab'}
            touchAction="pan-x pan-y"
            attributionControl={false}
            logoPosition="bottom-right"
            doubleClickZoom={true}
            scrollZoom={{ around: 'center' }}
            dragPan={true}
            dragRotate={false}
            keyboard={false}
            touchZoomRotate={true}
            touchPitch={false}
            cooperativeGestures={false}
            onResize={(e) => {
              // Force map to resize properly
              e.target.resize();
            }}
            onError={(error) => {
              console.error('Map error:', error);
            }}
            onLoad={(e) => {
              console.log('Map loaded successfully');
              const map = e.target;
              
              // Ensure map resizes properly on load
              setTimeout(() => map.resize(), 100);
              
              // Show administrative boundaries and place names
              map.on('styledata', () => {
                // Ensure place labels are visible at appropriate zoom levels
                if (map.getLayer('place-city-sm')) {
                  map.setLayoutProperty('place-city-sm', 'visibility', 'visible');
                }
                if (map.getLayer('place-town')) {
                  map.setLayoutProperty('place-town', 'visibility', 'visible');
                }
                if (map.getLayer('place-village')) {
                  map.setLayoutProperty('place-village', 'visibility', 'visible');
                }
                
                // Make admin boundaries more visible
                if (map.getLayer('admin-1-boundary')) {
                  map.setPaintProperty('admin-1-boundary', 'line-opacity', 0.8);
                }
                if (map.getLayer('admin-0-boundary')) {
                  map.setPaintProperty('admin-0-boundary', 'line-opacity', 0.8);
                }
              });
            }}
          >
            {/* Unisan Barangay Boundaries - Only render if GeoJSON data is loaded */}
            {geojsonData && !isLoadingGeoJSON && (
              <>
                <Source id="unisan-barangays" type="geojson" data={geojsonData}>
                  {/* Barangay Boundary Fill */}
                  <Layer
                    id="barangay-fill"
                    type="fill"
                    paint={{
                      'fill-color': '#e3f2fd',
                      'fill-opacity': 0.3
                    }}
                  />
                  {/* Barangay Boundary Lines */}
                  <Layer
                    id="barangay-boundaries"
                    type="line"
                    paint={{
                      'line-color': '#1976d2',
                      'line-width': 2,
                      'line-opacity': 0.7
                    }}
                  />
                  {/* Barangay Labels */}
                  <Layer
                    id="barangay-labels"
                    type="symbol"
                    layout={{
                      'text-field': ['get', 'adm4_en'],
                      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                      'text-size': {
                        'base': 1,
                        'stops': [[10, 10], [14, 12], [16, 14]]
                      },
                      'text-anchor': 'center',
                      'text-justify': 'center',
                      'symbol-placement': 'point'
                    }}
                    paint={{
                      'text-color': '#1565c0',
                      'text-halo-color': '#ffffff',
                      'text-halo-width': 1,
                      'text-opacity': 0.9
                    }}
                  />
                </Source>
              </>
            )}

            {/* Render all report pins */}
            {mapPins.map(pin => (
              <Marker
                key={pin.id}
                longitude={pin.longitude}
                latitude={pin.latitude}
                anchor="center"
              >
                <StatusMarker 
                  status={pin.status}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupInfo(pin);
                  }}
                />
              </Marker>
            ))}
            
            {/* Popup for selected report */}
            {popupInfo && (
              <Popup
                longitude={popupInfo.longitude}
                latitude={popupInfo.latitude}
                anchor="top"
                onClose={() => setPopupInfo(null)}
                closeButton={true}
                closeOnClick={false}
                style={{
                  zIndex: 1000
                }}
              >
                <Box sx={{ 
                  p: 1.5, 
                  minWidth: '200px',
                  backgroundColor: 'background.paper',
                  color: 'text.primary'
                }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                    {popupInfo.category}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    {popupInfo.description}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 1 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: STATUS_COLORS[popupInfo.status] 
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          textTransform: 'capitalize',
                          fontWeight: 500
                        }}
                      >
                        {popupInfo.status.replace('_', ' ')}
                      </Typography>
                    </Box>
                    {popupInfo.priority && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: popupInfo.priority === 'critical' ? 'error.main' : 
                                 popupInfo.priority === 'high' ? 'warning.main' : 'text.secondary',
                          fontWeight: 500,
                          textTransform: 'uppercase'
                        }}
                      >
                        {popupInfo.priority}
                      </Typography>
                    )}
                  </Box>
                  {popupInfo.created_at && (
                    <Typography variant="caption" display="block" mt={0.5} color="text.secondary">
                      {new Date(popupInfo.created_at).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Popup>
            )}
          </Map>
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default MapWidget;
