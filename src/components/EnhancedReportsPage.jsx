import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';

const statusColors = {
  pending: 'warning',
  acknowledged: 'info', 
  in_progress: 'primary',
  resolved: 'success',
  cancelled: 'error'
};

const priorityColors = {
  low: 'default',
  medium: 'warning',
  high: 'error',
  critical: 'error'
};

function EnhancedReportsPage({ user }) {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [reportUpdates, setReportUpdates] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchAll();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      
      // Fetch reports based on user role
      let reportsQuery = supabase
        .from('reports')
        .select(`
          *,
          categories(name, suggested_equipment, emergency_tips),
          users(name, email)
        `)
        .order('created_at', { ascending: false });

      // If user is agency, only show reports assigned to their agency
      if (userProfile?.role === 'agency' && userProfile?.agency_id) {
        reportsQuery = reportsQuery.contains('assigned_agency_ids', [userProfile.agency_id]);
      }

      const [reportsResult, categoriesResult, agenciesResult, usersResult] = await Promise.all([
        reportsQuery,
        supabase.from('categories').select('*'),
        supabase.from('agencies').select('*'),
        supabase.from('users').select('id, name, email, role')
      ]);

      if (reportsResult.error) throw reportsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (agenciesResult.error) throw agenciesResult.error;
      if (usersResult.error) throw usersResult.error;

      setReports(reportsResult.data || []);
      setCategories(categoriesResult.data || []);
      setAgencies(agenciesResult.data || []);
      setUsers(usersResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportUpdates = async (reportId) => {
    try {
      const { data, error } = await supabase
        .from('report_updates')
        .select(`
          *,
          users(name, email, role)
        `)
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReportUpdates(data || []);
    } catch (error) {
      console.error('Error fetching report updates:', error);
    }
  };

  const handleViewReport = async (report) => {
    setSelectedReport(report);
    await fetchReportUpdates(report.id);
    setDetailsOpen(true);
  };

  const handleAssignReport = async () => {
    try {
      const currentAgencies = selectedReport.assigned_agency_ids || [];
      const updatedAgencies = [...new Set([...currentAgencies, selectedAgency])];

      const { error } = await supabase
        .from('reports')
        .update({ 
          assigned_agency_ids: updatedAgencies,
          status: 'acknowledged',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      // Add update log
      const agency = agencies.find(a => a.id === selectedAgency);
      await supabase
        .from('report_updates')
        .insert({
          report_id: selectedReport.id,
          user_id: user.id,
          status: 'acknowledged',
          notes: `Report assigned to ${agency?.name}`
        });

      setAssignDialogOpen(false);
      setSelectedAgency('');
      fetchAll();
    } catch (error) {
      console.error('Error assigning report:', error);
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  const getAgencyNames = (agencyIds) => {
    if (!agencyIds || agencyIds.length === 0) return 'Not assigned';
    return agencyIds.map(id => {
      const agency = agencies.find(a => a.id === id);
      return agency ? agency.name : 'Unknown';
    }).join(', ');
  };

  // Filter reports by status for tabs
  const getFilteredReports = (status) => {
    if (status === 'all') return reports;
    return reports.filter(r => r.status === status);
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    acknowledged: reports.filter(r => r.status === 'acknowledged').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  const tabFilters = [
    { label: 'All Reports', value: 'all', count: stats.total },
    { label: 'Pending', value: 'pending', count: stats.pending },
    { label: 'Acknowledged', value: 'acknowledged', count: stats.acknowledged },
    { label: 'In Progress', value: 'in_progress', count: stats.inProgress },
    { label: 'Resolved', value: 'resolved', count: stats.resolved }
  ];

  const currentReports = getFilteredReports(tabFilters[currentTab].value);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box mb={{ xs: 2, sm: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" sx={{
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
        }}>
          Reports Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}>
          {userProfile?.role === 'agency' ? 'Your assigned reports' : 'All emergency reports'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1, sm: 2 }} mb={{ xs: 2, sm: 3 }} sx={{ width: '100%', m: 0 }}>
        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 }
                }}>
                  <AssignmentIcon sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'warning.main', 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 }
                }}>
                  <ScheduleIcon sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'info.main', 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 }
                }}>
                  <PeopleIcon sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    {stats.acknowledged}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Acknowledged
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 }
                }}>
                  <EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'success.main', 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 }
                }}>
                  <CheckCircleIcon sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    {stats.resolved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Resolved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Paper elevation={2} sx={{ borderRadius: { xs: 2, md: 3 }, width: '100%', overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 80, sm: 120 }
              }
            }}
          >
            {tabFilters.map((tab, index) => (
              <Tab 
                key={index}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {tab.label}
                    <Chip label={tab.count} size="small" />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Table */}
        <TableContainer sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading reports...</Typography>
          ) : currentReports.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No {tabFilters[currentTab].label.toLowerCase()} found.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Details</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentReports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {report.title || 'Emergency Report'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {report.users?.name || report.users?.email}
                        </Typography>
                        {report.address && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            {report.address}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getCategoryName(report.category_id)} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.priority?.toUpperCase()} 
                        size="small" 
                        color={priorityColors[report.priority]}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.status?.replace('_', ' ').toUpperCase()} 
                        size="small" 
                        color={statusColors[report.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getAgencyNames(report.assigned_agency_ids)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(report.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(report.created_at).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewReport(report)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {(userProfile?.role === 'admin' || userProfile?.role === 'superadmin') && (
                        <Tooltip title="Assign to Agency">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedReport(report);
                              setAssignDialogOpen(true);
                            }}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {/* Report Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Report Details
          <Typography variant="body2" color="text.secondary">
            {selectedReport?.title || 'Emergency Report'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Information</Typography>
                <Typography><strong>Category:</strong> {getCategoryName(selectedReport.category_id)}</Typography>
                <Typography><strong>Priority:</strong> {selectedReport.priority}</Typography>
                <Typography><strong>Status:</strong> {selectedReport.status}</Typography>
                <Typography><strong>Reporter:</strong> {selectedReport.users?.name || selectedReport.users?.email}</Typography>
                <Typography><strong>Date:</strong> {new Date(selectedReport.created_at).toLocaleString()}</Typography>
                {selectedReport.address && (
                  <Typography><strong>Location:</strong> {selectedReport.address}</Typography>
                )}
                <Typography sx={{ mt: 2 }}><strong>Description:</strong></Typography>
                <Typography color="text.secondary">{selectedReport.description}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Updates Timeline</Typography>
                <List dense>
                  {reportUpdates.map((update, index) => (
                    <ListItem key={update.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: statusColors[update.status] }}>
                          {update.status === 'resolved' ? <CheckCircleIcon /> : <EditIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Status: ${update.status.replace('_', ' ')}`}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              by {update.users?.name || update.users?.email} - {update.users?.role}
                            </Typography>
                            {update.notes && (
                              <Typography variant="body2">{update.notes}</Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {new Date(update.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Equipment Suggestions */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Equipment Suggestions</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {categories.find(c => c.id === selectedReport.category_id)?.suggested_equipment?.map((equipment, index) => (
                    <Chip key={index} label={equipment} variant="outlined" size="small" />
                  )) || <Typography color="text.secondary">No equipment suggestions available</Typography>}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Report Dialog */}
      <Dialog 
        open={assignDialogOpen} 
        onClose={() => setAssignDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Assign Report to Agency</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select Agency"
            value={selectedAgency}
            onChange={(e) => setSelectedAgency(e.target.value)}
            margin="normal"
          >
            {agencies.map((agency) => (
              <MenuItem key={agency.id} value={agency.id}>
                {agency.name} ({agency.type})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignReport} 
            variant="contained"
            disabled={!selectedAgency}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EnhancedReportsPage;
