import React from 'react';
import MapWidget from './MapWidget';
import StatsCards from './StatsCards';
import ReportsGraph from './ReportsGraph';
import CategoryPie from './CategoryPie';
import { Grid, Paper, Box } from '@mui/material';

const DashboardHome = () => (
  <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, mx: 'auto' }}>
    <Grid container columns={12} spacing={2}>
      <Grid sx={{ gridColumn: 'span 12' }}>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
          <StatsCards />
        </Paper>
      </Grid>
      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
          <MapWidget />
        </Paper>
      </Grid>
      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          <ReportsGraph />
        </Paper>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
          <CategoryPie />
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

export default DashboardHome;
