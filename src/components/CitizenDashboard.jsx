import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, Card, CardContent, CardActions, Chip, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { supabase } from '../supabaseClient';
import ReportFormDialog from './ReportFormDialog';
import EmergencyHotlines from './EmergencyHotlines';

const CitizenDashboard = ({ user }) => {
  const [recentReports, setRecentReports] = useState([]);
  const [emergencyTips, setEmergencyTips] = useState([]);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openHotlines, setOpenHotlines] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReports();
    fetchEmergencyTips();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          categories (name, color)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchEmergencyTips = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, emergency_tips, color')
        .limit(3);

      if (error) throw error;
      setEmergencyTips(data || []);
    } catch (error) {
      console.error('Error fetching emergency tips:', error);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Emergency Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)', color: 'white' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Emergency Response</Typography>
        <Typography variant="body1" mb={3} sx={{ opacity: 0.9 }}>
          Report emergencies quickly and get help from local authorities
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpenReportDialog(true)}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              fontWeight: 600,
              px: 3
            }}
          >
            Report Emergency
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PhoneIcon />}
            onClick={() => setOpenHotlines(true)}
            sx={{ 
              borderColor: 'rgba(255,255,255,0.5)', 
              color: 'white',
              '&:hover': { 
                borderColor: 'white', 
                bgcolor: 'rgba(255,255,255,0.1)' 
              },
              fontWeight: 600,
              px: 3
            }}
          >
            Emergency Hotlines
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Recent Reports */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600} color="primary.main">
                Recent Reports
              </Typography>
              <Button 
                size="small" 
                onClick={() => setOpenReportDialog(true)}
                startIcon={<AddIcon />}
              >
                New Report
              </Button>
            </Box>

            {recentReports.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  You haven't submitted any reports yet. Click "Report Emergency" to submit your first report.
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentReports.map((report) => (
                  <Card key={report.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {report.title || 'Emergency Report'}
                        </Typography>
                        <Chip
                          label={report.status}
                          color={getStatusColor(report.status)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {report.description}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Chip
                            label={report.categories?.name || 'Unknown'}
                            size="small"
                            sx={{ 
                              bgcolor: report.categories?.color || '#007bff',
                              color: 'white',
                              fontWeight: 500
                            }}
                          />
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(report.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Emergency Tips */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} color="primary.main" mb={2}>
              Emergency Tips
            </Typography>
            
            {loading ? (
              <Typography variant="body2" color="text.secondary">Loading tips...</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {emergencyTips.map((category, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ pb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ color: category.color }}>
                        {category.name}
                      </Typography>
                      {category.emergency_tips?.slice(0, 2).map((tip, tipIndex) => (
                        <Typography key={tipIndex} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          • {tip}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Location Access Notice */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, borderRadius: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <LocationOnIcon />
          <Typography variant="body2">
            <strong>Location Services:</strong> For faster emergency response, please allow location access when submitting reports.
          </Typography>
        </Box>
      </Paper>

      {/* Dialogs */}
      <ReportFormDialog
        open={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
        user={user}
        onReportSubmitted={fetchRecentReports}
      />

      <EmergencyHotlines
        open={openHotlines}
        onClose={() => setOpenHotlines(false)}
      />
    </Box>
  );
};

export default CitizenDashboard;
