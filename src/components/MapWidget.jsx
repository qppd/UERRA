
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const MapWidget = () => (
  <Box>
    <Typography variant="h6" fontWeight={600} mb={1} color="primary.main">
      Live Incident Map
    </Typography>
    <iframe
      title="Unisan Map"
      width="100%"
      height="260"
      style={{border:0, borderRadius: '10px'}}
      loading="lazy"
      allowFullScreen
      src="https://www.openstreetmap.org/export/embed.html?bbox=122.0,13.8,122.3,14.1&layer=mapnik"
    ></iframe>
  </Box>
);

export default MapWidget;
