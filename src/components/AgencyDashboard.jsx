import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import MapWidget from './MapWidget';

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

function AgencyDashboard({ user }) {
  const [reports, setReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchReports();
    fetchCategories();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, agencies(*)')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch all reports that are assigned to this user's agency
      const { data: allReports, error } = await supabase
        .from('reports')
        .select(`
          *,
          categories(name, suggested_equipment),
          users(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(allReports || []);
      
      // Filter reports assigned to this agency
      if (userProfile?.agency_id) {
        const filtered = allReports?.filter(report => 
          report.assigned_agency_ids?.includes(userProfile.agency_id)
        ) || [];
        setAssignedReports(filtered);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAcceptReport = async (reportId) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'acknowledged',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Add update log
      await supabase
        .from('report_updates')
        .insert({
          report_id: reportId,
          user_id: user.id,
          status: 'acknowledged',
          notes: 'Report acknowledged by agency'
        });

      fetchReports();
    } catch (error) {
      console.error('Error accepting report:', error);
    }
  };

  const handleUpdateReport = async () => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: updateStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      // Add update log
      await supabase
        .from('report_updates')
        .insert({
          report_id: selectedReport.id,
          user_id: user.id,
          status: updateStatus,
          notes: updateNotes
        });

      setUpdateDialogOpen(false);
      setUpdateStatus('');
      setUpdateNotes('');
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const getEquipmentSuggestions = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.suggested_equipment || [];
  };

  const openUpdateDialog = (report) => {
    setSelectedReport(report);
    setUpdateStatus(report.status);
    setUpdateDialogOpen(true);
  };

  // Statistics
  const stats = {
    total: assignedReports.length,
    pending: assignedReports.filter(r => r.status === 'pending').length,
    inProgress: assignedReports.filter(r => r.status === 'in_progress').length,
    resolved: assignedReports.filter(r => r.status === 'resolved').length
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Agency Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {userProfile?.agencies?.name || 'Loading...'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assigned
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <UpdateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.resolved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Reports List */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              Assigned Reports
            </Typography>
            
            {loading ? (
              <Typography>Loading reports...</Typography>
            ) : assignedReports.length === 0 ? (
              <Typography color="text.secondary">
                No reports assigned to your agency yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {report.title || 'Untitled Report'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {report.users?.name || report.users?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.categories?.name} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.priority} 
                            size="small" 
                            color={priorityColors[report.priority]}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status} 
                            size="small" 
                            color={statusColors[report.status]}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          {report.status === 'pending' ? (
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={() => handleAcceptReport(report.id)}
                            >
                              Accept
                            </Button>
                          ) : (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => openUpdateDialog(report)}
                            >
                              Update
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Side Panel */}
        <Grid item xs={12} lg={4}>
          {/* Map Widget */}
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              Report Locations
            </Typography>
            <MapWidget reports={assignedReports} />
          </Paper>

          {/* Equipment Suggestions */}
          {selectedReport && (
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" color="primary.main" mb={2}>
                <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Equipment Suggestions
              </Typography>
              <List dense>
                {getEquipmentSuggestions(selectedReport.category_id).map((equipment, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <BuildIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={equipment} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Update Report Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Report Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              margin="normal"
            >
              <MenuItem value="acknowledged">Acknowledged</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Update Notes"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              margin="normal"
              placeholder="Enter details about the status update..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateReport} variant="contained">
            Update Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AgencyDashboard;
