


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

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FqZWRobSIsImEiOiJjbWUwZTI2bmUwMzRmMmtzOTV3aHIzb3pwIn0.vmkwo0fWsqc9-rJhYRb_2g'; // <-- Replace with your Mapbox token
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
  return (
    <ErrorBoundary>
      <Box>
        <Typography variant="h6" fontWeight={600} mb={1} color="primary.main">
          Live Incident Map
        </Typography>
        {isMapReady ? (
          <Map
            initialViewState={{ longitude: MAP_CENTER[0], latitude: MAP_CENTER[1], zoom: 12 }}
            style={{ width: '100%', height: 260, borderRadius: 10 }}
            mapStyle={mapStyle}
            mapboxAccessToken={MAPBOX_TOKEN}
            getCursor={() => 'grab'}
            touchAction="none"
            onResize={() => {}}
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
        ) : (
          <div style={{color:'red',padding:'1em'}}>Map cannot be loaded: Invalid configuration.</div>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default MapWidget;
