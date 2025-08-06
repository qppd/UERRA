
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

import Agencies from './AgencyManagement';
import Categories from './CategoryManagement';
import Users from './UsersManagement';

export function AdminUsers() {
  return <Users />;
}

export function AdminAgencies() {
  return <Agencies />;
}

export function AdminCategories() {
  return <Categories />;
}

export function AdminLogsAnalytics() {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 300 }}>
      <Typography variant="h6" color="primary.main" mb={2}>Logs & Analytics</Typography>
      <Typography color="text.secondary">System logs and analytics will be shown here.</Typography>
    </Paper>
  );
}

export function AdminSystemInfo() {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 300 }}>
      <Typography variant="h6" color="primary.main" mb={2}>System Info</Typography>
      <Typography color="text.secondary">System update and patch info will be shown here.</Typography>
    </Paper>
  );
}
