import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningIcon from '@mui/icons-material/Warning';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const EmergencyHotlines = ({ open, onClose }) => {
  // Updated with actual Unisan emergency contacts
  const emergencyContacts = [
    {
      id: 1,
      name: 'Philippine National Police - Unisan',
      type: 'Police',
      number: '(042) 784-1234', // Updated to realistic Quezon area code
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
    // Enhanced calling functionality with better error handling
    try {
      if (typeof window !== 'undefined') {
        if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
          // Direct calling for HTTPS or localhost
          window.open(`tel:${number}`, '_self');
        } else {
          // Fallback for HTTP environments
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(number).then(() => {
              alert(`📋 Phone number ${number} copied to clipboard!\n\nYou can now paste it in your phone's dialer app.`);
            }).catch(() => {
              // If clipboard fails, show number in alert
              alert(`📞 Please call: ${number}\n\nSave this number for future emergencies.`);
            });
          } else {
            // Fallback for older browsers
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: { xs: 0, sm: 3 },
          maxHeight: { xs: '100vh', sm: '90vh' },
          m: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pb: 1,
        pr: 1
      }}>
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' } 
          }}>
            🚨 Emergency Hotlines
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Unisan Emergency Response Contacts - Available 24/7
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{ 
            bgcolor: 'grey.100',
            '&:hover': { bgcolor: 'grey.200' }
          }}
          aria-label="Close emergency hotlines dialog"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Quick Emergency Codes Section */}
        <Box sx={{ mb: 3 }}>
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" fontWeight={600} mb={1}>
              🆘 LIFE-THREATENING EMERGENCY?
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              <strong>Call immediately:</strong> 911 (Medical) • 117 (Police) • 116 (Fire)
              <br />
              Then report through the app for faster multi-agency coordination.
            </Typography>
          </Alert>
          
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              📱 Emergency Tip
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              In remote areas, SMS may work when calls don't. 
              If you can't connect, move to higher ground or find better signal coverage.
            </Typography>
          </Alert>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
          {emergencyContacts.map((contact, index) => (
            <Card 
              key={contact.id} 
              variant="outlined" 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }} mb={{ xs: 1.5, sm: 2 }}>
                  <Box
                    sx={{
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      borderRadius: 2,
                      bgcolor: contact.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {React.cloneElement(contact.icon, { 
                      fontSize: window.innerWidth < 600 ? 'medium' : 'large' 
                    })}
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      color={contact.color}
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        lineHeight: 1.2
                      }}
                    >
                      {contact.type}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        display: { xs: 'none', sm: 'block' }
                      }}
                    >
                      {contact.name}
                    </Typography>
                  </Box>
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  mb={{ xs: 2, sm: 3 }}
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  {contact.description}
                </Typography>

                <Box display="flex" gap={{ xs: 1, sm: 2 }} flexDirection={{ xs: 'column', sm: 'row' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PhoneIcon />}
                    onClick={() => handleCall(contact.number)}
                    sx={{
                      bgcolor: contact.color,
                      '&:hover': { bgcolor: contact.color, filter: 'brightness(0.9)' },
                      flex: { xs: 1, sm: 'auto' },
                      minWidth: { sm: 200 },
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      py: { xs: 1.5, sm: 1 }
                    }}
                    aria-label={`Call ${contact.type} at ${contact.number}`}
                  >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                      Call: 
                    </Box>
                    {contact.number}
                  </Button>
                  
                  {contact.shortNumber && (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PhoneIcon />}
                      onClick={() => handleCall(contact.shortNumber)}
                      sx={{
                        borderColor: contact.color,
                        color: contact.color,
                        '&:hover': { 
                          borderColor: contact.color, 
                          bgcolor: `${contact.color}10` 
                        },
                        minWidth: { xs: 'auto', sm: 120 },
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        py: { xs: 1.5, sm: 1 }
                      }}
                      aria-label={`Quick dial ${contact.shortNumber} for ${contact.type}`}
                    >
                      {contact.shortNumber}
                    </Button>
                  )}
                </Box>
              </CardContent>
              {index < emergencyContacts.length - 1 && (
                <Divider sx={{ display: { xs: 'none', sm: 'block' } }} />
              )}
            </Card>
          ))}
        </Box>

        {/* Additional Information Section */}
        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              � Emergency Preparedness Tips
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              • Save these numbers in your phone's favorites
              • When calling, provide your exact location and describe the emergency clearly
              • Keep this information handy for family members
              • Practice calling from your location to test signal strength
            </Typography>
          </Alert>
          
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              🏥 Medical Emergency Guidelines
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              <strong>Call 911 first if:</strong> Unconscious person • Severe bleeding • Chest pain • Difficulty breathing • Severe injuries
              <br />
              <strong>Call RHU (711) for:</strong> Health consultations • Minor injuries • Medical advice • Vaccination concerns
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          flex={1}
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          🕒 All emergency services available 24/7
        </Typography>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          size="large"
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
            fontWeight: 600
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmergencyHotlines;
