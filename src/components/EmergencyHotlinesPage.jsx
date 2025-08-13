import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Alert,
  Grid,
  Container
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningIcon from '@mui/icons-material/Warning';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const EmergencyHotlinesPage = () => {
  // Emergency contacts data
  const emergencyContacts = [
    {
      id: 1,
      name: 'Philippine National Police - Unisan',
      type: 'Police',
      number: '(042) 784-1234',
      shortNumber: '117',
      icon: <LocalPoliceIcon />,
      color: '#1976d2',
      description: 'For crimes, security incidents, traffic accidents, and public safety concerns'
    },
    {
      id: 2,
      name: 'Bureau of Fire Protection - Unisan',
      type: 'Fire Department', 
      number: '(042) 784-2345',
      shortNumber: '116',
      icon: <LocalFireDepartmentIcon />,
      color: '#d32f2f',
      description: 'For fire emergencies, rescue operations, hazmat incidents, and structural collapses'
    },
    {
      id: 3,
      name: 'Unisan District Hospital',
      type: 'Medical Emergency',
      number: '(042) 784-3456',
      shortNumber: '911',
      icon: <LocalHospitalIcon />,
      color: '#388e3c',
      description: 'For medical emergencies, ambulance services, and life-threatening health conditions'
    },
    {
      id: 4,
      name: 'Municipal Disaster Risk Reduction Office',
      type: 'Disaster Management',
      number: '(042) 784-4567',
      shortNumber: '143',
      icon: <WarningIcon />,
      color: '#f57c00',
      description: 'For natural disasters, floods, landslides, evacuations, and severe weather warnings'
    },
    {
      id: 5,
      name: 'Rural Health Unit - Unisan',
      type: 'Health Services',
      number: '(042) 784-5678',
      shortNumber: '711',
      icon: <HealthAndSafetyIcon />,
      color: '#7b1fa2',
      description: 'For health consultations, medical assistance, and public health concerns'
    }
  ];

  const handleCall = (number) => {
    try {
      if (typeof window !== 'undefined') {
        if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
          window.open(`tel:${number}`, '_self');
        } else {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(number).then(() => {
              alert(`📋 Phone number ${number} copied to clipboard!\n\nYou can now paste it in your phone's dialer app.`);
            }).catch(() => {
              alert(`📞 Please call: ${number}\n\nSave this number for future emergencies.`);
            });
          } else {
            alert(`📞 Emergency Contact: ${number}\n\nPlease dial this number immediately.`);
          }
        }
      }
    } catch (error) {
      console.error('Error handling call:', error);
      alert(`📞 Emergency Contact: ${number}\n\nPlease dial this number immediately.`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Paper elevation={2} sx={{ 
        p: { xs: 3, sm: 4 }, 
        mb: 3, 
        borderRadius: { xs: 2, md: 3 }, 
        background: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)', 
        color: 'white' 
      }}>
        <Typography variant="h4" fontWeight={700} mb={1} sx={{
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
        }}>
          🚨 Emergency Hotlines
        </Typography>
        <Typography variant="body1" sx={{ 
          opacity: 0.9,
          fontSize: { xs: '1rem', sm: '1.125rem' }
        }}>
          Quick access to all Unisan emergency response contacts - Available 24/7
        </Typography>
      </Paper>

      {/* Emergency Alert */}
      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={1}>
          🆘 For Life-Threatening Emergencies
        </Typography>
        <Typography variant="body1">
          Call immediately: <strong>911 (Medical) • 117 (Police) • 116 (Fire)</strong>
          <br />
          Then report through the app for faster multi-agency coordination.
        </Typography>
      </Alert>

      {/* Emergency Contacts Grid */}
      <Grid container spacing={3}>
        {emergencyContacts.map((contact) => (
          <Grid item xs={12} md={6} key={contact.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: contact.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {React.cloneElement(contact.icon, { fontSize: 'large' })}
                  </Box>
                  <Box flex={1}>
                    <Typography 
                      variant="h5" 
                      fontWeight={600} 
                      color={contact.color}
                      sx={{ mb: 0.5, lineHeight: 1.2 }}
                    >
                      {contact.type}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {contact.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Description */}
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  mb={3}
                  sx={{ flex: 1, lineHeight: 1.5 }}
                >
                  {contact.description}
                </Typography>

                {/* Call Buttons */}
                <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PhoneIcon />}
                    onClick={() => handleCall(contact.number)}
                    sx={{
                      bgcolor: contact.color,
                      '&:hover': { bgcolor: contact.color, filter: 'brightness(0.9)' },
                      flex: 1,
                      fontWeight: 600,
                      py: 1.5
                    }}
                  >
                    Call: {contact.number}
                  </Button>
                  
                  {contact.shortNumber && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => handleCall(contact.shortNumber)}
                      sx={{
                        borderColor: contact.color,
                        color: contact.color,
                        '&:hover': { 
                          borderColor: contact.color, 
                          bgcolor: `${contact.color}15` 
                        },
                        minWidth: 100,
                        fontWeight: 600,
                        py: 1.5
                      }}
                    >
                      {contact.shortNumber}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer Information */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Alert severity="success" sx={{ borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                💡 Emergency Preparedness Tips
              </Typography>
              <Typography variant="body2">
                • Save these numbers in your phone's favorites
                <br />
                • When calling, provide your exact location and describe the emergency clearly
                <br />
                • Keep this information handy for family members
                <br />
                • Practice calling from your location to test signal strength
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="info" sx={{ borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                🏥 Medical Emergency Guidelines
              </Typography>
              <Typography variant="body2">
                <strong>Call 911 first if:</strong> Unconscious person • Severe bleeding • Chest pain • Difficulty breathing • Severe injuries
                <br /><br />
                <strong>Call RHU (711) for:</strong> Health consultations • Minor injuries • Medical advice • Vaccination concerns
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default EmergencyHotlinesPage;
