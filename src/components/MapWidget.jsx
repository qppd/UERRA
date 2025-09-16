


import React, { useEffect, useState, useRef } from 'react';
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
import { Typography, Box } from '@mui/material';
import { supabase } from '../supabaseClient';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1Ijoic2FqZWRobSIsImEiOiJjbWUwZTI2bmUwMzRmMmtzOTV3aHIzb3pwIn0.vmkwo0fWsqc9-rJhYRb_2g'; // Fallback to hardcoded token
const MAP_CENTER = [121.99, 13.86]; // [lng, lat] for Unisan municipality center

// Status to color mapping
const STATUS_COLORS = {
  'pending': '#ef4444',        // Red - Not Yet Under Control
  'acknowledged': '#f97316',   // Orange - Responding  
  'in_progress': '#eab308',    // Yellow - Contained
  'resolved': '#22c55e',       // Green - Safe
  'cancelled': '#6b7280'       // Gray - Other
};

// Sample pins for demonstration
const SAMPLE_PINS = [
  { id: 'sample-1', longitude: 121.99, latitude: 13.86, status: 'pending', category: 'Fire', description: 'House fire on Main Street' },
  { id: 'sample-2', longitude: 121.995, latitude: 13.865, status: 'acknowledged', category: 'Medical', description: 'Medical emergency at clinic' },
  { id: 'sample-3', longitude: 121.985, latitude: 13.855, status: 'in_progress', category: 'Crime', description: 'Robbery report' },
  { id: 'sample-4', longitude: 122.005, latitude: 13.870, status: 'resolved', category: 'Disaster', description: 'Flood monitoring' },
  { id: 'sample-5', longitude: 121.975, latitude: 13.850, status: 'cancelled', category: 'Other', description: 'False alarm' },
  { id: 'sample-6', longitude: 122.010, latitude: 13.875, status: 'pending', category: 'Fire', description: 'Brush fire near highway' },
  { id: 'sample-7', longitude: 121.980, latitude: 13.845, status: 'in_progress', category: 'Medical', description: 'Ambulance dispatch' }
];

// Unisan Municipality Boundary GeoJSON Data (based on actual barangay boundaries)
const UNISAN_BOUNDARY_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Unisan Municipality",
        "province": "Quezon"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          // Northern boundary (Mairok Ilaya, Bonifacio area)
          [121.938, 13.923], [121.955, 13.922], [121.971, 13.920], [121.985, 13.918],
          [122.000, 13.915], [122.015, 13.912], [122.030, 13.908], [122.043, 13.903],
          
          // Eastern boundary (Balagtas, Mabini area)
          [122.051, 13.896], [122.052, 13.885], [122.051, 13.875], [122.048, 13.865],
          [122.045, 13.855], [122.042, 13.845], [122.038, 13.835], [122.034, 13.825],
          
          // Southern boundary (Caigdal, Cabulihan area)
          [122.030, 13.815], [122.025, 13.810], [122.020, 13.807], [122.010, 13.805],
          [122.000, 13.805], [121.990, 13.807], [121.980, 13.810], [121.970, 13.815],
          
          // Western boundary (Malvar, Kalilayan area)
          [121.960, 13.820], [121.952, 13.825], [121.945, 13.832], [121.940, 13.840],
          [121.938, 13.850], [121.937, 13.860], [121.936, 13.870], [121.937, 13.880],
          [121.938, 13.890], [121.939, 13.900], [121.940, 13.910], [121.938, 13.923]
        ]]
      }
    }
  ]
};

// Barangay location points for labels (approximate centers of each barangay)
const UNISAN_BARANGAYS_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "name": "Almacen" }, "geometry": { "type": "Point", "coordinates": [121.995, 13.870] } },
    { "type": "Feature", "properties": { "name": "Balagtas" }, "geometry": { "type": "Point", "coordinates": [122.047, 13.850] } },
    { "type": "Feature", "properties": { "name": "Balanacan" }, "geometry": { "type": "Point", "coordinates": [121.995, 13.850] } },
    { "type": "Feature", "properties": { "name": "Bonifacio" }, "geometry": { "type": "Point", "coordinates": [122.030, 13.880] } },
    { "type": "Feature", "properties": { "name": "Bulo Ibaba" }, "geometry": { "type": "Point", "coordinates": [121.975, 13.868] } },
    { "type": "Feature", "properties": { "name": "Bulo Ilaya" }, "geometry": { "type": "Point", "coordinates": [121.955, 13.878] } },
    { "type": "Feature", "properties": { "name": "Burgos" }, "geometry": { "type": "Point", "coordinates": [121.955, 13.890] } },
    { "type": "Feature", "properties": { "name": "Cabulihan Ibaba" }, "geometry": { "type": "Point", "coordinates": [122.022, 13.815] } },
    { "type": "Feature", "properties": { "name": "Cabulihan Ilaya" }, "geometry": { "type": "Point", "coordinates": [122.015, 13.835] } },
    { "type": "Feature", "properties": { "name": "Caigdal" }, "geometry": { "type": "Point", "coordinates": [122.030, 13.840] } },
    { "type": "Feature", "properties": { "name": "F. de Jesus (Poblacion)" }, "geometry": { "type": "Point", "coordinates": [121.977, 13.838] } },
    { "type": "Feature", "properties": { "name": "General Luna" }, "geometry": { "type": "Point", "coordinates": [122.015, 13.847] } },
    { "type": "Feature", "properties": { "name": "Kalilayan Ibaba" }, "geometry": { "type": "Point", "coordinates": [121.965, 13.850] } },
    { "type": "Feature", "properties": { "name": "Kalilayan Ilaya" }, "geometry": { "type": "Point", "coordinates": [121.952, 13.857] } },
    { "type": "Feature", "properties": { "name": "Mabini" }, "geometry": { "type": "Point", "coordinates": [122.035, 13.860] } },
    { "type": "Feature", "properties": { "name": "Mairok Ibaba" }, "geometry": { "type": "Point", "coordinates": [121.970, 13.895] } },
    { "type": "Feature", "properties": { "name": "Mairok Ilaya" }, "geometry": { "type": "Point", "coordinates": [121.965, 13.905] } },
    { "type": "Feature", "properties": { "name": "Malvar" }, "geometry": { "type": "Point", "coordinates": [121.982, 13.825] } },
    { "type": "Feature", "properties": { "name": "Maputat" }, "geometry": { "type": "Point", "coordinates": [122.000, 13.815] } },
    { "type": "Feature", "properties": { "name": "Muliguin" }, "geometry": { "type": "Point", "coordinates": [121.985, 13.840] } },
    { "type": "Feature", "properties": { "name": "Pagaguasan" }, "geometry": { "type": "Point", "coordinates": [121.970, 13.860] } },
    { "type": "Feature", "properties": { "name": "Panaon Ibaba" }, "geometry": { "type": "Point", "coordinates": [121.985, 13.875] } },
    { "type": "Feature", "properties": { "name": "Panaon Ilaya" }, "geometry": { "type": "Point", "coordinates": [121.975, 13.885] } },
    { "type": "Feature", "properties": { "name": "Plaridel" }, "geometry": { "type": "Point", "coordinates": [122.015, 13.870] } },
    { "type": "Feature", "properties": { "name": "Poctol" }, "geometry": { "type": "Point", "coordinates": [122.000, 13.885] } }
  ]
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
  const [todayReports, setTodayReports] = useState([]);
  const [pastReports, setPastReports] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchReports = async () => {
      const today = new Date();
      const todayISO = today.toISOString().slice(0, 10);
      // Fetch today's reports
      const { data: todayData } = await supabase
        .from('reports')
        .select('id, description, location, category_id, status, created_at')
        .gte('created_at', todayISO);
      setTodayReports(todayData || []);

      // Fetch past reports (before today)
      const { data: pastData } = await supabase
        .from('reports')
        .select('id, location, created_at')
        .lt('created_at', todayISO);
      setPastReports(pastData || []);
    };
    fetchReports();
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

  // Helper to parse location (lat, lng)
  const getLatLng = (loc) => {
    if (!loc) return null;
    if (typeof loc === 'string') {
      try {
        const obj = JSON.parse(loc);
        if (obj.lat && obj.lng) return [obj.lng, obj.lat]; // Mapbox uses [lng, lat]
      } catch {
        const [lat, lng] = loc.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) return [lng, lat];
      }
    } else if (typeof loc === 'object' && loc.lat && loc.lng) {
      return [loc.lng, loc.lat];
    }
    return null;
  };

  // Combine real reports with sample pins for demonstration
  const allPins = [
    ...SAMPLE_PINS,
    ...todayReports.map(r => {
      const coords = getLatLng(r.location);
      return coords ? {
        id: r.id,
        longitude: coords[0],
        latitude: coords[1],
        status: r.status,
        category: r.category_id,
        description: r.description,
        isReal: true
      } : null;
    }).filter(Boolean)
  ];

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

  return (
    <ErrorBoundary>
      <Box sx={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
      className="full-width-map"
      >
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
        
        <Box sx={{ 
          width: '100%', 
          height: 'calc(100% - 60px)',
          minHeight: { xs: '300px', sm: '350px', md: '400px' },
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#1a1a1a',
          boxShadow: theme => theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.6)' 
            : '0 8px 32px rgba(0,0,0,0.15)',
          border: theme => theme.palette.mode === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.1)'
        }}
        className="map-container"
        >
          <Map
            ref={mapRef}
            initialViewState={{ 
              longitude: MAP_CENTER[0], 
              latitude: MAP_CENTER[1], 
              zoom: 14
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
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
            {/* Unisan Municipality Boundary */}
            <Source id="unisan-boundary" type="geojson" data={UNISAN_BOUNDARY_GEOJSON}>
              <Layer
                id="unisan-boundary-fill"
                type="fill"
                paint={{
                  'fill-color': '#2196f3',
                  'fill-opacity': 0.15
                }}
              />
              <Layer
                id="unisan-boundary-glow"
                type="line"
                paint={{
                  'line-color': '#64b5f6',
                  'line-width': 8,
                  'line-opacity': 0.3,
                  'line-blur': 2
                }}
              />
              <Layer
                id="unisan-boundary-line"
                type="line"
                paint={{
                  'line-color': '#1976d2',
                  'line-width': 4,
                  'line-opacity': 0.9,
                  'line-dasharray': [3, 3]
                }}
              />
              <Layer
                id="unisan-boundary-label"
                type="symbol"
                layout={{
                  'text-field': 'UNISAN MUNICIPALITY',
                  'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                  'text-size': 16,
                  'text-transform': 'uppercase',
                  'text-letter-spacing': 0.1,
                  'text-offset': [0, 0],
                  'text-anchor': 'center'
                }}
                paint={{
                  'text-color': '#1976d2',
                  'text-halo-color': '#ffffff',
                  'text-halo-width': 2,
                  'text-opacity': 0.8
                }}
              />
            </Source>

            {/* Barangay Labels */}
            <Source id="unisan-barangays" type="geojson" data={UNISAN_BARANGAYS_GEOJSON}>
              <Layer
                id="barangay-labels"
                type="symbol"
                layout={{
                  'text-field': ['get', 'name'],
                  'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                  'text-size': {
                    'base': 1.2,
                    'stops': [[12, 10], [14, 12], [16, 14]]
                  },
                  'text-transform': 'none',
                  'text-letter-spacing': 0.05,
                  'text-offset': [0, 0.5],
                  'text-anchor': 'top',
                  'text-max-width': 8,
                  'text-line-height': 1.2
                }}
                paint={{
                  'text-color': '#333333',
                  'text-halo-color': '#ffffff',
                  'text-halo-width': 1.5,
                  'text-opacity': {
                    'base': 1,
                    'stops': [[12, 0], [13, 0.6], [14, 1]]
                  }
                }}
              />
            </Source>

            {/* Render all pins */}
            {allPins.map(pin => (
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
                    gap: 1 
                  }}>
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
                    {!popupInfo.isReal && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontStyle: 'italic'
                        }}
                      >
                        (Sample)
                      </Typography>
                    )}
                  </Box>
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
