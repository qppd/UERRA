import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

import Agencies from './AgencyManagement';
import Categories from './CategoryManagement';
import Users from './UsersManagement';
import EnhancedUsersManagement from './EnhancedUsersManagement';

export function AdminUsers() {
  return <EnhancedUsersManagement />;
}

export function AdminAgencies() {
  return <Agencies />;
}

export function AdminCategories() {
  return <Categories />;
}

export function AdminLogsAnalytics() {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: { xs: 2, md: 3 },
        width: '100%'
      }}>
        <Typography variant="h6" sx={{
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          Analytics coming soon...
        </Typography>
      </Paper>
    </Box>
  );
}

export function AdminSystemInfo() {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: { xs: 2, md: 3 },
        width: '100%'
      }}>
        <Typography variant="h6" sx={{
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          System info coming soon...
        </Typography>
      </Paper>
    </Box>
  );
}
