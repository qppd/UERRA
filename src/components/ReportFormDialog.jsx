import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import { supabase } from '../supabaseClient';
import CitizenReportService from '../services/CitizenReportService';

const ReportFormDialog = ({ open, onClose, user, onReportSubmitted }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    priority: 'medium',
    address: '',
    location: null
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleChecked, setRoleChecked] = useState(false);

  // Check user role when dialog opens
  useEffect(() => {
    if (open && user) {
      checkUserRole();
    }
  }, [open, user]);

  useEffect(() => {
    if (open && roleChecked) {
      fetchCategories();
      resetForm();
    }
  }, [open, roleChecked]);

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setUserRole(data.role);
      setRoleChecked(true);

      if (data.role !== 'citizen') {
        setError('Only citizens are authorized to submit emergency reports');
      }
    } catch (error) {
      setError('Failed to verify user permissions');
      console.error('Role check error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      title: '',
      description: '',
      priority: 'medium',
      address: '',
      location: null
    });
    setSelectedCategory(null);
    setPhotoFile(null);
    setPhotoPreview('');
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'category_id') {
      const category = categories.find(c => c.id === value);
      setSelectedCategory(category);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=1`
          );
          const data = await response.json();
          
          const address = data.features?.[0]?.place_name || `${latitude}, ${longitude}`;
          
          setFormData(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude },
            address: address
          }));
        } catch (error) {
          // If reverse geocoding fails, just use coordinates
          setFormData(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude },
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        }
        
        setLocationLoading(false);
      },
      (error) => {
        setError('Failed to get your location. Please enter address manually.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo must be less than 5MB');
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return null;

    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, photoFile);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.category_id || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    // Check description length
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the CitizenReportService for secure report submission
      const result = await CitizenReportService.submitReport(
        formData, 
        user, 
        photoFile
      );

      if (result.success) {
        // Call the callback to refresh reports
        if (onReportSubmitted) {
          onReportSubmitted();
        }
        onClose();
      } else {
        setError(result.error || 'Failed to submit report');
      }
    } catch (error) {
      setError(error.message || 'Failed to submit report');
      console.error('Error submitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
        Report Emergency
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Role verification and security notice */}
        {!roleChecked ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>Verifying user permissions...</Typography>
          </Box>
        ) : userRole !== 'citizen' ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon />
              <Typography variant="h6">Access Restricted</Typography>
            </Box>
            <Typography>
              Only citizens are authorized to submit emergency reports. Your current role is: <strong>{userRole}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              If you believe this is an error, please contact your system administrator.
            </Typography>
          </Alert>
        ) : (
          <>
            {/* Security notice for citizens */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon />
                <Typography variant="subtitle2">Citizen Emergency Reporting</Typography>
              </Box>
              <Typography variant="body2">
                This form is exclusively for emergency reporting by Unisan citizens. All submissions are logged and verified.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Category Selection */}
          <FormControl fullWidth required>
            <InputLabel>Emergency Type</InputLabel>
            <Select
              value={formData.category_id}
              label="Emergency Type"
              onChange={(e) => handleInputChange('category_id', e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: category.color || '#007bff'
                      }}
                    />
                    {category.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Emergency Tips */}
          {selectedCategory?.emergency_tips && selectedCategory.emergency_tips.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main' }}>
              <Typography variant="subtitle2" fontWeight={600} color="warning.dark" mb={1}>
                🚨 Emergency Tips for {selectedCategory.name}:
              </Typography>
              {selectedCategory.emergency_tips.slice(0, 3).map((tip, index) => (
                <Typography key={index} variant="body2" color="warning.dark" sx={{ mb: 0.5 }}>
                  • {tip}
                </Typography>
              ))}
            </Paper>
          )}

          {/* Title (Optional) */}
          <TextField
            label="Title (Optional)"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            fullWidth
            placeholder="Brief description of the emergency"
          />

          {/* Description */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
            placeholder="Describe the emergency situation in detail..."
            helperText={`${formData.description.length}/1000 characters (minimum 10 required)`}
            error={formData.description.length > 0 && formData.description.trim().length < 10}
          />

          {/* Priority */}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <MenuItem value="low">
                <Chip label="Low" color="success" size="small" sx={{ mr: 1 }} />
                Low Priority
              </MenuItem>
              <MenuItem value="medium">
                <Chip label="Medium" color="warning" size="small" sx={{ mr: 1 }} />
                Medium Priority
              </MenuItem>
              <MenuItem value="high">
                <Chip label="High" color="error" size="small" sx={{ mr: 1 }} />
                High Priority
              </MenuItem>
              <MenuItem value="critical">
                <Chip label="Critical" color="error" variant="filled" size="small" sx={{ mr: 1 }} />
                Critical Emergency
              </MenuItem>
            </Select>
          </FormControl>

          {/* Location */}
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={locationLoading ? <CircularProgress size={16} /> : <LocationOnIcon />}
                onClick={getCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? 'Getting Location...' : 'Use Current Location'}
              </Button>
            </Box>
            
            <TextField
              label="Address/Location"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              fullWidth
              placeholder="Enter the location of the emergency"
              helperText="Using current location helps responders find you faster"
            />
          </Box>

          {/* Photo Upload */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Photo (Optional)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
              >
                Choose Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
              
              {photoPreview && (
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 8
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Photos help responders understand the situation better (Max 5MB)
            </Typography>
          </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.category_id || !formData.description || formData.description.trim().length < 10 || userRole !== 'citizen'}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportFormDialog;
