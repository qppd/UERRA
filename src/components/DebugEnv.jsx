import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const DebugEnv = () => {
  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6">Environment Debug</Typography>
      <Typography>VITE_MAPBOX_TOKEN: {import.meta.env.VITE_MAPBOX_TOKEN ? `${import.meta.env.VITE_MAPBOX_TOKEN.substring(0, 20)}...` : 'undefined'}</Typography>
      <Typography>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL.substring(0, 30)}...` : 'undefined'}</Typography>
      <Typography>MODE: {import.meta.env.MODE}</Typography>
      <Typography>DEV: {import.meta.env.DEV ? 'true' : 'false'}</Typography>
    </Paper>
  );
};

export default DebugEnv;
