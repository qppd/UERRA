import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Paper } from '@mui/material';
import { supabase } from '../supabaseClient';
import { upsertUserProfile } from '../useUserProfile';

const ProfileTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testProfileCreation = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');

      console.log('Current user:', user);

      // Test profile creation
      const { data, error } = await upsertUserProfile({
        id: user.id,
        email: user.email,
        role: 'citizen',
        agency_id: null,
      });

      console.log('Profile creation result:', { data, error });

      if (error) throw error;

      setResult({
        success: true,
        message: 'Profile created/updated successfully!',
        data: data
      });

    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentProfile = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');

      // Check if profile exists
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile check result:', { data, error });

      setResult({
        success: !error,
        message: data ? 'Profile found!' : 'No profile found',
        data: data,
        error: error
      });

    } catch (error) {
      console.error('Check failed:', error);
      setResult({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Profile Creation Test
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <Button 
          variant="contained" 
          onClick={checkCurrentProfile}
          disabled={loading}
        >
          Check Current Profile
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testProfileCreation}
          disabled={loading}
        >
          Test Profile Creation
        </Button>
      </Box>

      {loading && (
        <Typography color="primary">
          Processing...
        </Typography>
      )}

      {result && (
        <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Result:</strong> {result.message}
          </Typography>
          {result.data && (
            <Typography variant="caption" component="pre" sx={{ mt: 1, display: 'block' }}>
              {JSON.stringify(result.data, null, 2)}
            </Typography>
          )}
          {result.error && (
            <Typography variant="caption" component="pre" sx={{ mt: 1, display: 'block', color: 'error.main' }}>
              {JSON.stringify(result.error, null, 2)}
            </Typography>
          )}
        </Alert>
      )}
    </Paper>
  );
};

export default ProfileTest;
