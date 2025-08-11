import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import FireTruckIcon from '@mui/icons-material/FireTruck';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SecurityIcon from '@mui/icons-material/Security';
import FloodIcon from '@mui/icons-material/Flood';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { supabase } from '../supabaseClient';

const EmergencyTips = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('fire')) return <FireTruckIcon />;
    if (name.includes('medical') || name.includes('health')) return <MedicalServicesIcon />;
    if (name.includes('crime') || name.includes('security') || name.includes('police')) return <SecurityIcon />;
    if (name.includes('flood') || name.includes('disaster') || name.includes('natural')) return <FloodIcon />;
    if (name.includes('road') || name.includes('accident') || name.includes('traffic')) return <DirectionsCarIcon />;
    return <InfoIcon />;
  };

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setDetailsOpen(true);
  };

  const generalTips = [
    {
      title: "Stay Calm",
      description: "Keep calm and think clearly. Panic can lead to poor decisions during emergencies."
    },
    {
      title: "Call for Help",
      description: "Contact emergency services immediately. Use the emergency hotlines or submit a report through this app."
    },
    {
      title: "Provide Clear Information",
      description: "Give your exact location, describe the emergency, and follow dispatcher instructions."
    },
    {
      title: "Stay Safe",
      description: "Your safety is the priority. Don't put yourself in danger to help others unless you're trained."
    },
    {
      title: "Keep Emergency Kit Ready",
      description: "Maintain a basic emergency kit with first aid supplies, flashlight, water, and important documents."
    }
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} color="primary.main" mb={3}>
        Emergency Tips & Safety Guidelines
      </Typography>

      {/* General Emergency Tips */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" fontWeight={600} color="info.dark" mb={2}>
          🚨 General Emergency Guidelines
        </Typography>
        <Grid container spacing={2}>
          {generalTips.map((tip, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} mb={1} color="info.dark">
                    {tip.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tip.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Category-Specific Tips */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} color="primary.main" mb={3}>
          Emergency Type Specific Tips
        </Typography>

        {loading ? (
          <Typography color="text.secondary">Loading emergency tips...</Typography>
        ) : (
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => handleViewDetails(category)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: category.color || '#007bff',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getCategoryIcon(category.name)}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {category.name}
                      </Typography>
                    </Box>

                    {category.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {category.description}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {category.emergency_tips?.length || 0} safety tips available
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ borderColor: category.color, color: category.color }}
                    >
                      View Tips
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedCategory && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: selectedCategory.color || '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getCategoryIcon(selectedCategory.name)}
              </Box>
            )}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedCategory?.name} Emergency Tips
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Safety guidelines and best practices
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setDetailsOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedCategory && (
            <Box>
              {selectedCategory.description && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="body2">{selectedCategory.description}</Typography>
                </Alert>
              )}

              <Typography variant="h6" fontWeight={600} mb={2}>
                🛡️ Safety Tips
              </Typography>

              {selectedCategory.emergency_tips && selectedCategory.emergency_tips.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedCategory.emergency_tips.map((tip, index) => (
                    <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ py: 2 }}>
                        <Box display="flex" alignItems="start" gap={2}>
                          <Chip
                            label={index + 1}
                            size="small"
                            sx={{
                              bgcolor: selectedCategory.color,
                              color: 'white',
                              fontWeight: 600,
                              minWidth: 28
                            }}
                          />
                          <Typography variant="body1">{tip}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    No specific tips available for this emergency type yet.
                    Please follow general emergency guidelines.
                  </Typography>
                </Alert>
              )}

              {selectedCategory.suggested_equipment && selectedCategory.suggested_equipment.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    🚨 Emergency Equipment (For Responders)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedCategory.suggested_equipment.map((equipment, index) => (
                      <Chip
                        key={index}
                        label={equipment}
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: selectedCategory.color, color: selectedCategory.color }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 4, p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                <Typography variant="body2" color="warning.dark" fontWeight={500}>
                  ⚠️ Remember: These tips are for general guidance only. 
                  In case of immediate danger, prioritize your safety and call emergency services right away.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyTips;
