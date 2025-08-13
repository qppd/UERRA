


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
const MAP_CENTER = [122.1, 13.933]; // [lng, lat] for Unisan

const heatmapLayer = {
  id: 'heatmap',
  type: 'heatmap',
  source: 'reports',
  maxzoom: 15,
  paint: {
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'weight'],
      0, 0,
      1, 1
    ],
    'heatmap-intensity': 1,
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': 20,
    'heatmap-opacity': 0.7
  }
};

const MapWidget = () => {
  const [todayReports, setTodayReports] = useState([]);
  const [pastReports, setPastReports] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);

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

  // GeoJSON for heatmap (past reports)
  const heatmapGeojson = {
    type: 'FeatureCollection',
    features: pastReports
      .map(r => {
        const coords = getLatLng(r.location);
        if (!coords) return null;
        return {
          type: 'Feature',
          properties: { weight: 1 },
          geometry: { type: 'Point', coordinates: coords }
        };
      })
      .filter(Boolean)
  };

  // Validate mapStyle and required props
  const mapStyle = "mapbox://styles/mapbox/streets-v11";
  const isMapReady = Array.isArray(MAP_CENTER) && MAP_CENTER.length === 2 && typeof MAPBOX_TOKEN === 'string' && MAPBOX_TOKEN.length > 0;

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'undefined' || MAPBOX_TOKEN === 'no-token') {
    return (
      <Box>
        <Typography variant="h6" fontWeight={600} mb={1} color="primary.main">
          Live Incident Map
        </Typography>
        <Box 
          sx={{ 
            width: '100%', 
            height: 260, 
            borderRadius: 2,
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
      <Box sx={{ width: '100%', height: '100%' }}>
        <Typography 
          variant="h6" 
          fontWeight={600} 
          mb={1} 
          color="primary.main"
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          Live Incident Map
        </Typography>
        {isMapReady ? (
          <Box sx={{ 
            width: '100%', 
            height: { xs: 300, sm: 350, md: 400 }, 
            borderRadius: { xs: 2, md: 3 },
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Map
              initialViewState={{ longitude: MAP_CENTER[0], latitude: MAP_CENTER[1], zoom: 12 }}
              style={{ width: '100%', height: '100%' }}
              mapStyle={mapStyle}
              mapboxAccessToken={MAPBOX_TOKEN}
              getCursor={() => 'grab'}
              touchAction="none"
              onResize={() => {}}
              onError={(error) => {
                // Map error occurred
              }}
              onLoad={() => {
                // Map loaded successfully
              }}
            >
            {/* Pins for today's reports */}
            {todayReports.map(r => {
              const coords = getLatLng(r.location);
              if (!coords) return null;
              return (
                <Marker
                  key={r.id}
                  longitude={coords[0]}
                  latitude={coords[1]}
                  anchor="bottom"
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo({ ...r, coords });
                  }}
                />
              );
            })}
            {/* Popup for selected report */}
            {popupInfo && (
              <Popup
                longitude={popupInfo.coords[0]}
                latitude={popupInfo.coords[1]}
                anchor="top"
                onClose={() => setPopupInfo(null)}
              >
                <div>
                  <b>{popupInfo.category_id}</b><br />
                  {popupInfo.description}<br />
                  <small>Status: {popupInfo.status}</small>
                </div>
              </Popup>
            )}
            {/* Heatmap for past reports */}
            {heatmapGeojson.features.length > 0 && (
              <Source id="reports" type="geojson" data={heatmapGeojson}>
                <Layer {...heatmapLayer} />
              </Source>
            )}
            </Map>
          </Box>
        ) : (
          <Box sx={{ 
            p: 2, 
            textAlign: 'center', 
            color: 'error.main',
            backgroundColor: 'error.light',
            borderRadius: 2
          }}>
            <Typography>Map cannot be loaded: Invalid configuration.</Typography>
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default MapWidget;
