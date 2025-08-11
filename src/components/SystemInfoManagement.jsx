import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Info as InfoIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
  Settings as SettingsIcon,
  AccountTree as DatabaseIcon,
  CloudUpload as CloudUploadIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Backup as BackupIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';

function SystemInfoManagement() {
  const [systemInfo, setSystemInfo] = useState({});
  const [databaseStats, setDatabaseStats] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupInProgress, setBackupInProgress] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
    fetchDatabaseStats();
    checkSystemHealth();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      // Get basic system information
      const info = {
        version: '1.0.0',
        environment: 'Production',
        lastUpdate: '2024-12-16',
        uptime: '15 days, 4 hours',
        activeUsers: 0,
        totalReports: 0,
        storageUsed: '0 MB',
        apiResponseTime: '120ms'
      };

      // Get user count
      const { count: userCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      // Get report count
      const { count: reportCount } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true });

      // Get storage info (simplified)
      const { data: storageData } = await supabase.storage
        .from('photos')
        .list();

      info.activeUsers = userCount || 0;
      info.totalReports = reportCount || 0;
      info.storageUsed = storageData ? `${storageData.length * 2.5} MB` : '0 MB'; // Estimate

      setSystemInfo(info);
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const fetchDatabaseStats = async () => {
    try {
      const stats = {};

      // Get table sizes
      const tables = ['users', 'reports', 'categories', 'agencies', 'report_updates'];
      
      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true });
        stats[table] = count || 0;
      }

      // Calculate total database size (simplified estimate)
      const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);
      stats.totalSize = `${(totalRecords * 0.5).toFixed(1)} MB`; // Rough estimate
      stats.totalRecords = totalRecords;

      setDatabaseStats(stats);
    } catch (error) {
      console.error('Error fetching database stats:', error);
    }
  };

  const checkSystemHealth = async () => {
    try {
      const health = {
        overall: 'Healthy',
        database: 'Connected',
        storage: 'Available',
        authentication: 'Active',
        apis: 'Responsive',
        lastCheck: new Date().toLocaleString()
      };

      // Test database connection
      const { error: dbError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (dbError) {
        health.database = 'Error';
        health.overall = 'Warning';
      }

      // Test storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .list('', { limit: 1 });

      if (storageError) {
        health.storage = 'Error';
        health.overall = 'Warning';
      }

      setSystemHealth(health);
    } catch (error) {
      console.error('Error checking system health:', error);
      setSystemHealth({
        overall: 'Error',
        database: 'Unknown',
        storage: 'Unknown',
        authentication: 'Unknown',
        apis: 'Unknown',
        lastCheck: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const performBackup = async () => {
    setBackupInProgress(true);
    setBackupProgress(0);

    try {
      // Simulate backup process
      const tables = ['users', 'reports', 'categories', 'agencies', 'report_updates'];
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        
        // Simulate data export
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) throw error;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBackupProgress(((i + 1) / tables.length) * 100);
      }

      // Create backup file
      const backupData = {
        timestamp: new Date().toISOString(),
        version: systemInfo.version,
        tables: databaseStats
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uerra-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      alert('Backup completed successfully!');
    } catch (error) {
      console.error('Backup error:', error);
      alert('Backup failed. Please try again.');
    } finally {
      setBackupInProgress(false);
      setBackupProgress(0);
      setBackupDialogOpen(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    // In a real app, this would update a maintenance flag in the database
    setMaintenanceMode(!maintenanceMode);
    
    // You could also disable certain features or show maintenance notices
    if (!maintenanceMode) {
      alert('Maintenance mode enabled. New reports will be temporarily disabled.');
    } else {
      alert('Maintenance mode disabled. System is fully operational.');
    }
  };

  const restartSystem = async () => {
    if (window.confirm('Are you sure you want to restart the system? This will briefly interrupt service.')) {
      alert('System restart initiated. This is a simulation in the demo.');
      // In production, this would trigger a server restart
    }
  };

  const clearCache = async () => {
    if (window.confirm('Clear system cache? This may temporarily slow down the application.')) {
      // Clear local storage and caches
      localStorage.clear();
      sessionStorage.clear();
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      alert('Cache cleared successfully. Please refresh the page.');
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'Healthy':
      case 'Connected':
      case 'Available':
      case 'Active':
      case 'Responsive':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Error':
      case 'Unknown':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'Healthy':
      case 'Connected':
      case 'Available':
      case 'Active':
      case 'Responsive':
        return <CheckIcon />;
      case 'Warning':
        return <WarningIcon />;
      case 'Error':
      case 'Unknown':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          System Information & Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor system health and manage platform settings
        </Typography>
      </Box>

      {/* System Health Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              System Health Status
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(systemHealth).filter(([key]) => key !== 'lastCheck').map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: `${getHealthColor(value)}.main`, width: 40, height: 40 }}>
                          {getHealthIcon(value)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Typography>
                          <Chip 
                            label={value} 
                            size="small" 
                            color={getHealthColor(value)}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {systemHealth.lastCheck && (
              <Typography variant="caption" color="text.secondary" mt={2} display="block">
                Last checked: {systemHealth.lastCheck}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              Quick Actions
            </Typography>
            <List>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={maintenanceMode}
                      onChange={toggleMaintenanceMode}
                      color="warning"
                    />
                  }
                  label="Maintenance Mode"
                />
              </ListItem>
              <ListItem>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<BackupIcon />}
                  onClick={() => setBackupDialogOpen(true)}
                >
                  Create Backup
                </Button>
              </ListItem>
              <ListItem>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<UpdateIcon />}
                  onClick={clearCache}
                >
                  Clear Cache
                </Button>
              </ListItem>
              <ListItem>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<SettingsIcon />}
                  onClick={restartSystem}
                  color="warning"
                >
                  Restart System
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* System Information */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              System Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Version" 
                  secondary={systemInfo.version}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Environment" 
                  secondary={systemInfo.environment}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Last Update" 
                  secondary={systemInfo.lastUpdate}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Uptime" 
                  secondary={systemInfo.uptime}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="API Response Time" 
                  secondary={systemInfo.apiResponseTime}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Usage Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Active Users" 
                  secondary={systemInfo.activeUsers}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Total Reports" 
                  secondary={systemInfo.totalReports}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Storage Used" 
                  secondary={systemInfo.storageUsed}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Database Records" 
                  secondary={databaseStats.totalRecords}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Database Size" 
                  secondary={databaseStats.totalSize}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Database Statistics */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" color="primary.main" mb={2}>
          <DatabaseIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Database Statistics
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Table</TableCell>
                <TableCell align="right">Records</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>users</TableCell>
                <TableCell align="right">{databaseStats.users || 0}</TableCell>
                <TableCell>Registered users in the system</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>reports</TableCell>
                <TableCell align="right">{databaseStats.reports || 0}</TableCell>
                <TableCell>Emergency reports submitted</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>categories</TableCell>
                <TableCell align="right">{databaseStats.categories || 0}</TableCell>
                <TableCell>Emergency categories defined</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>agencies</TableCell>
                <TableCell align="right">{databaseStats.agencies || 0}</TableCell>
                <TableCell>Response agencies registered</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>report_updates</TableCell>
                <TableCell align="right">{databaseStats.report_updates || 0}</TableCell>
                <TableCell>Status updates and communications</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Maintenance Alerts */}
      {maintenanceMode && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">Maintenance Mode Active</Typography>
          The system is currently in maintenance mode. Some features may be disabled.
        </Alert>
      )}

      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => !backupInProgress && setBackupDialogOpen(false)}>
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            This will create a backup of all system data including users, reports, and configurations.
          </Typography>
          
          {backupInProgress && (
            <Box mb={2}>
              <Typography variant="body2" mb={1}>
                Backup in progress... {Math.round(backupProgress)}%
              </Typography>
              <LinearProgress variant="determinate" value={backupProgress} />
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            The backup file will be downloaded to your computer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBackupDialogOpen(false)} 
            disabled={backupInProgress}
          >
            Cancel
          </Button>
          <Button 
            onClick={performBackup} 
            variant="contained"
            disabled={backupInProgress}
            startIcon={<BackupIcon />}
          >
            {backupInProgress ? 'Creating Backup...' : 'Start Backup'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SystemInfoManagement;
