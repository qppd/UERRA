import React from 'react';
import MapWithOverlayStats from './MapWithOverlayStats';
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
      
      {/* Map Widget with Overlay Stats - Full Width, Increased Height */}
      <Grid item xs={12} sm={12} md={12} lg={9} xl={10} sx={{ width: '100%', maxWidth: '100%' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 0, // Remove padding to make overlay flush with edges
            borderRadius: { xs: 2, md: 3, lg: 4 }, 
            height: { 
              xs: '400px', 
              sm: '450px', 
              md: '550px', 
              lg: '600px',
              xl: '650px' 
            },
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden', // Ensure rounded corners are respected
            background: theme => theme.palette.mode === 'dark' 
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: theme => theme.palette.mode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 20px 40px rgba(0,0,0,0.4)' 
              : '0 20px 40px rgba(0,0,0,0.1)'
          }}
        >
          <MapWithOverlayStats />
        </Paper>
      </Grid>
      
      {/* Charts - Hidden on Mobile/Tablet, Compact Side Panel on Large Screens */}
      <Grid item xs={12} lg={3} xl={2} sx={{ display: { xs: 'none', lg: 'block' } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row', md: 'column' }, 
          gap: { xs: 1, sm: 2, md: 3 },
          height: '100%'
        }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, sm: 2, md: 2.5 }, 
              borderRadius: { xs: 2, md: 3 },
              flex: 1,
              minHeight: { xs: '200px', sm: '180px', md: '240px', lg: '260px' }
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
              minHeight: { xs: '200px', sm: '180px', md: '240px', lg: '260px' }
            }}
          >
            <CategoryPie />
          </Paper>
        </Box>
      </Grid>
      
      {/* Charts Row - Visible on Mobile/Tablet Below Map */}
      <Grid container item xs={12} spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ display: { xs: 'flex', lg: 'none' } }}>
        <Grid item xs={12} sm={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, sm: 2, md: 2.5 }, 
              borderRadius: { xs: 2, md: 3 },
              minHeight: { xs: '200px', sm: '180px', md: '240px' }
            }}
          >
            <ReportsGraph />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, sm: 2, md: 2.5 }, 
              borderRadius: { xs: 2, md: 3 },
              minHeight: { xs: '200px', sm: '180px', md: '240px' }
            }}
          >
            <CategoryPie />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  </Box>
);

export default DashboardHome;
