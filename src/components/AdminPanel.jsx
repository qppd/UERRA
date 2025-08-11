
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

import Agencies from './AgencyManagement';
import Categories from './CategoryManagement';
import Users from './UsersManagement';
import EnhancedUsersManagement from './EnhancedUsersManagement';
import AdvancedAnalyticsLogs from './AdvancedAnalyticsLogs';
import SystemInfoManagement from './SystemInfoManagement';

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
  return <AdvancedAnalyticsLogs />;
}

export function AdminSystemInfo() {
  return <SystemInfoManagement />;
}
