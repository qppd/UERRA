import React from 'react';
import MapWidget from './MapWidget';
import StatsCards from './StatsCards';
import ReportsGraph from './ReportsGraph';
import CategoryPie from './CategoryPie';
import { Grid, Paper, Box } from '@mui/material';

const DashboardHome = () => (
  <Box sx={{ 
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden'
  }}>
    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ width: '100%', m: 0 }}>
      {/* Stats Cards - Full Width */}
      <Grid item xs={12}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 1.5, sm: 2, md: 3 }, 
            borderRadius: { xs: 2, md: 3 },
            width: '100%'
          }}
        >
          <StatsCards />
        </Paper>
      </Grid>
      
      {/* Map Widget - Responsive Width */}
      <Grid item xs={12} lg={8}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 1.5, sm: 2, md: 3 }, 
            borderRadius: { xs: 2, md: 3 }, 
            height: { xs: '300px', sm: '400px', md: '450px' },
            width: '100%'
          }}
        >
          <MapWidget />
        </Paper>
      </Grid>
      
      {/* Charts - Responsive Layout */}
      <Grid item xs={12} lg={4}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row', lg: 'column' }, 
          gap: { xs: 1, sm: 2, md: 3 },
          height: '100%'
        }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, sm: 2, md: 2.5 }, 
              borderRadius: { xs: 2, md: 3 },
              flex: 1,
              minHeight: { xs: '250px', sm: '200px', lg: '210px' }
            }}
          >
            <ReportsGraph />
          </Paper>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, sm: 2, md: 2.5 }, 
              borderRadius: { xs: 2, md: 3 },
              flex: 1,
              minHeight: { xs: '250px', sm: '200px', lg: '210px' }
            }}
          >
            <CategoryPie />
          </Paper>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

export default DashboardHome;
