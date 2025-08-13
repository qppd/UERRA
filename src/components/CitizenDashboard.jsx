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
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Emergency Actions */}
      <Paper elevation={2} sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 2, sm: 3 }, 
        borderRadius: { xs: 2, md: 3 }, 
        background: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)', 
        color: 'white',
        width: '100%'
      }}>
        <Typography variant="h5" fontWeight={700} mb={2} sx={{
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
        }}>
          Emergency Response
        </Typography>
        <Typography variant="body1" mb={3} sx={{ 
          opacity: 0.9,
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}>
          Report emergencies quickly and get help from local authorities
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpenReportDialog(true)}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              width: { xs: '100%', sm: 'auto' }
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
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Emergency Hotlines
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%', m: 0 }}>
        {/* Recent Reports */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: { xs: 2, md: 3 },
            width: '100%'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Typography variant="h6" fontWeight={600} color="primary.main" sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                Recent Reports
              </Typography>
              <Button 
                size="small" 
                onClick={() => setOpenReportDialog(true)}
                startIcon={<AddIcon />}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1.5, sm: 2 }
                }}
              >
                New Report
              </Button>
            </Box>

            {recentReports.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  You haven't submitted any reports yet. Click "Report Emergency" to submit your first report.
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                {recentReports.map((report) => (
                  <Card key={report.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ pb: 1, p: { xs: 1.5, sm: 2 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1} sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 }
                      }}>
                        <Typography variant="subtitle1" fontWeight={500} sx={{
                          fontSize: { xs: '0.95rem', sm: '1rem' }
                        }}>
                          {report.title || 'Emergency Report'}
                        </Typography>
                        <Chip
                          label={report.status}
                          color={getStatusColor(report.status)}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                            alignSelf: { xs: 'flex-start', sm: 'flex-end' }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={1} sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        {report.description}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2} sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1, sm: 2 }
                      }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Chip
                            label={report.categories?.name || 'Unknown'}
                            size="small"
                            sx={{ 
                              bgcolor: report.categories?.color || '#007bff',
                              color: 'white',
                              fontWeight: 500,
                              fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                            }}
                          />
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary" sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}>
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
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: { xs: 2, md: 3 },
            width: '100%'
          }}>
            <Typography variant="h6" fontWeight={600} color="primary.main" mb={2} sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}>
              Emergency Tips
            </Typography>
            
            {loading ? (
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Loading tips...
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                {emergencyTips.map((category, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ pb: 2, p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ 
                        color: category.color,
                        fontSize: { xs: '0.85rem', sm: '0.875rem' }
                      }}>
                        {category.name}
                      </Typography>
                      {category.emergency_tips?.slice(0, 2).map((tip, tipIndex) => (
                        <Typography key={tipIndex} variant="body2" color="text.secondary" sx={{ 
                          mb: 0.5,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}>
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
      <Paper elevation={1} sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        mt: { xs: 2, sm: 3 }, 
        borderRadius: 2, 
        bgcolor: 'info.light', 
        color: 'info.contrastText',
        width: '100%'
      }}>
        <Box display="flex" alignItems="center" gap={1} sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <LocationOnIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          <Typography variant="body2" sx={{
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}>
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
