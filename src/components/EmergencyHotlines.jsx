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
  const emergencyContacts = [
    {
      id: 1,
      name: 'Philippine National Police - Unisan',
      type: 'Police',
      number: '(042) 123-4567',
      shortNumber: '117',
      icon: <LocalPoliceIcon />,
      color: '#1976d2',
      description: 'For crimes, security incidents, and traffic accidents'
    },
    {
      id: 2,
      name: 'Bureau of Fire Protection - Unisan',
      type: 'Fire Department',
      number: '(042) 765-4321',
      shortNumber: '116',
      icon: <LocalFireDepartmentIcon />,
      color: '#d32f2f',
      description: 'For fire emergencies and rescue operations'
    },
    {
      id: 3,
      name: 'Unisan District Hospital',
      type: 'Hospital',
      number: '(042) 111-2222',
      shortNumber: '911',
      icon: <LocalHospitalIcon />,
      color: '#388e3c',
      description: 'For medical emergencies and ambulance services'
    },
    {
      id: 4,
      name: 'Municipal Disaster Risk Reduction Office',
      type: 'Disaster Management',
      number: '(042) 333-4444',
      shortNumber: '143',
      icon: <WarningIcon />,
      color: '#f57c00',
      description: 'For natural disasters, floods, and evacuations'
    },
    {
      id: 5,
      name: 'Rural Health Unit - Unisan',
      type: 'Health Center',
      number: '(042) 555-6666',
      shortNumber: '711',
      icon: <HealthAndSafetyIcon />,
      color: '#7b1fa2',
      description: 'For health concerns and medical consultations'
    }
  ];

  const handleCall = (number) => {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      window.open(`tel:${number}`, '_self');
    } else {
      // Fallback for development or non-HTTPS environments
      navigator.clipboard.writeText(number).then(() => {
        alert(`Phone number ${number} copied to clipboard`);
      }).catch(() => {
        alert(`Please call: ${number}`);
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>Emergency Hotlines</Typography>
          <Typography variant="body2" color="text.secondary">
            Unisan Emergency Response Contacts
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              🚨 For Life-Threatening Emergencies
            </Typography>
            <Typography variant="body2">
              Call immediately and report through the app for faster coordination with multiple agencies.
              In remote areas, SMS may work when calls don't.
            </Typography>
          </Alert>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {emergencyContacts.map((contact, index) => (
            <Card key={contact.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: contact.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {contact.icon}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} color={contact.color}>
                      {contact.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contact.name}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={3}>
                  {contact.description}
                </Typography>

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PhoneIcon />}
                    onClick={() => handleCall(contact.number)}
                    sx={{
                      bgcolor: contact.color,
                      '&:hover': { bgcolor: contact.color, filter: 'brightness(0.9)' },
                      flex: 1,
                      fontWeight: 600
                    }}
                  >
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
                        minWidth: 100,
                        fontWeight: 600
                      }}
                    >
                      {contact.shortNumber}
                    </Button>
                  )}
                </Box>
              </CardContent>
              {index < emergencyContacts.length - 1 && <Divider />}
            </Card>
          ))}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              📱 Pro Tip
            </Typography>
            <Typography variant="body2">
              Save these numbers in your phone's emergency contacts for faster access.
              When calling, provide your exact location and describe the emergency clearly.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" flex={1}>
          Available 24/7 for emergency response
        </Typography>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmergencyHotlines;
