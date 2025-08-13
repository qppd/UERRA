import React, { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoIcon from '@mui/icons-material/Photo';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '../supabaseClient';
import ReportFormDialog from './ReportFormDialog';

const MyReports = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportUpdates, setReportUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            emergency_tips
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
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
          users (
            email,
            name
          )
        `)
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReportUpdates(data || []);
    } catch (error) {
      console.error('Error fetching report updates:', error);
      setReportUpdates([]);
    }
  };

  const handleViewDetails = async (report) => {
    setSelectedReport(report);
    setDetailsOpen(true);
    await fetchReportUpdates(report.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'acknowledged': return 'info';
      case 'in_progress': return 'primary';
      case 'resolved': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending': return 'Your report has been received and is waiting for review';
      case 'acknowledged': return 'Authorities have acknowledged your report';
      case 'in_progress': return 'Responders are on their way or working on your case';
      case 'resolved': return 'Your emergency has been resolved';
      case 'cancelled': return 'Report was cancelled';
      default: return '';
    }
  };

  const filterReports = (status) => {
    if (tabValue === 0) return reports;
    if (tabValue === 1) return reports.filter(r => ['pending', 'acknowledged', 'in_progress'].includes(r.status));
    if (tabValue === 2) return reports.filter(r => r.status === 'resolved');
    if (tabValue === 3) return reports.filter(r => r.status === 'cancelled');
    return reports;
  };

  const filteredReports = filterReports();

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={{ xs: 2, sm: 3 }} sx={{
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" sx={{
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          My Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setReportFormOpen(true)}
          sx={{ 
            borderRadius: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 2, sm: 3 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          New Report
        </Button>
      </Box>

      <Paper elevation={2} sx={{ 
        borderRadius: { xs: 2, md: 3 }, 
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)} 
            sx={{ 
              px: { xs: 1, sm: 2 },
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 60, sm: 120 }
              }
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${reports.length})`} />
            <Tab label={`Active (${reports.filter(r => ['pending', 'acknowledged', 'in_progress'].includes(r.status)).length})`} />
            <Tab label={`Resolved (${reports.filter(r => r.status === 'resolved').length})`} />
            <Tab label={`Cancelled (${reports.filter(r => r.status === 'cancelled').length})`} />
          </Tabs>
        </Box>

        {/* Reports Table */}
        <TableContainer sx={{ 
          maxHeight: 600, 
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 600, sm: 800 }
          }
        }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Loading your reports...
              </Typography>
            </Box>
          ) : filteredReports.length === 0 ? (
            <Box sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
              <Alert severity="info" sx={{ maxWidth: 400, mx: 'auto' }}>
                <Typography variant="h6" mb={1} sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  No reports found
                </Typography>
                <Typography variant="body2" mb={2} sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  {tabValue === 0 
                    ? "You haven't submitted any reports yet."
                    : "No reports found for this status."}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setReportFormOpen(true)}
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Submit Your First Report
                </Button>
              </Alert>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Emergency Type
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', sm: 'table-cell' }
                  }}>
                    Description
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', md: 'table-cell' }
                  }}>
                    Priority
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Date
                  </TableCell>
                  <TableCell align="center" sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: { xs: 10, sm: 12 },
                            height: { xs: 10, sm: 12 },
                            borderRadius: '50%',
                            bgcolor: report.categories?.color || '#007bff'
                          }}
                        />
                        <Typography variant="body2" fontWeight={500} sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                          {report.categories?.name || 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" noWrap sx={{ 
                        maxWidth: { sm: 150, md: 200 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {report.title || report.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={getStatusColor(report.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.priority}
                        color={getPriorityColor(report.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateShort(report.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(report)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {/* Report Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>Report Details</Typography>
          <IconButton onClick={() => setDetailsOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedReport && (
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Emergency Information
                    </Typography>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Emergency Type
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: selectedReport.categories?.color || '#007bff'
                          }}
                        />
                        <Typography variant="body1" fontWeight={500}>
                          {selectedReport.categories?.name || 'Unknown'}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedReport.title && (
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Title
                        </Typography>
                        <Typography variant="body1">{selectedReport.title}</Typography>
                      </Box>
                    )}

                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1">{selectedReport.description}</Typography>
                    </Box>

                    <Box display="flex" gap={2} mb={2}>
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Status
                        </Typography>
                        <Chip
                          label={selectedReport.status}
                          color={getStatusColor(selectedReport.status)}
                          variant="outlined"
                        />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Priority
                        </Typography>
                        <Chip
                          label={selectedReport.priority}
                          color={getPriorityColor(selectedReport.priority)}
                        />
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Submitted: {formatDate(selectedReport.created_at)}
                      </Typography>
                    </Box>

                    {selectedReport.address && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {selectedReport.address}
                        </Typography>
                      </Box>
                    )}

                    {selectedReport.photo_url && (
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Photo Evidence
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhotoIcon fontSize="small" color="action" />
                          <Button
                            size="small"
                            onClick={() => window.open(selectedReport.photo_url, '_blank')}
                          >
                            View Photo
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Status Updates & Emergency Tips */}
              <Grid item xs={12} md={6}>
                {/* Status Updates */}
                <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Status Updates
                    </Typography>
                    
                    {reportUpdates.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No updates available yet
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {reportUpdates.map((update, index) => (
                          <Box key={update.id}>
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                              <Chip
                                label={update.status}
                                color={getStatusColor(update.status)}
                                size="small"
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(update.created_at)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {update.notes || getStatusDescription(update.status)}
                            </Typography>
                            {index < reportUpdates.length - 1 && <Divider sx={{ mt: 1 }} />}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Emergency Tips */}
                {selectedReport.categories?.emergency_tips && selectedReport.categories.emergency_tips.length > 0 && (
                  <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'warning.light' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2} color="warning.dark">
                        Emergency Tips
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {selectedReport.categories.emergency_tips.map((tip, index) => (
                          <Typography key={index} variant="body2" color="warning.dark">
                            • {tip}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Report Form Dialog */}
      <ReportFormDialog
        open={reportFormOpen}
        onClose={() => setReportFormOpen(false)}
        user={user}
        onReportSubmitted={fetchReports}
      />
    </Box>
  );
};

export default MyReports;
