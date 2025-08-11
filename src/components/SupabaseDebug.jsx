import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Paper, Typography, Button, Alert } from '@mui/material';

const SupabaseDebug = () => {
  const [config, setConfig] = useState(null);
  const [connectionTest, setConnectionTest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check configuration
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setConfig({
      url: url || 'Not set',
      keyLength: key ? key.length : 0,
      hasUrl: !!url,
      hasKey: !!key
    });
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection with a simple query
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        setConnectionTest({
          success: false,
          error: error.message,
          details: error
        });
      } else {
        setConnectionTest({
          success: true,
          message: 'Connection successful!'
        });
      }
    } catch (err) {
      setConnectionTest({
        success: false,
        error: err.message,
        details: err
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      // Test auth service
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setConnectionTest({
          success: false,
          error: 'Auth error: ' + error.message,
          details: error
        });
      } else {
        setConnectionTest({
          success: true,
          message: 'Auth service working!',
          data: data
        });
      }
    } catch (err) {
      setConnectionTest({
        success: false,
        error: 'Auth test failed: ' + err.message,
        details: err
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Supabase Configuration Debug
        </Typography>
        
        {config && (
          <Box mb={2}>
            <Typography variant="body2">
              <strong>Supabase URL:</strong> {config.url}
            </Typography>
            <Typography variant="body2">
              <strong>API Key Length:</strong> {config.keyLength} characters
            </Typography>
            <Typography variant="body2">
              <strong>Configuration Status:</strong> {
                config.hasUrl && config.hasKey 
                  ? '✅ Properly configured' 
                  : '❌ Missing configuration'
              }
            </Typography>
          </Box>
        )}

        <Box display="flex" gap={2} mb={2}>
          <Button 
            variant="outlined" 
            onClick={testConnection}
            disabled={loading}
          >
            Test Database Connection
          </Button>
          <Button 
            variant="outlined" 
            onClick={testAuth}
            disabled={loading}
          >
            Test Auth Service
          </Button>
        </Box>

        {connectionTest && (
          <Alert 
            severity={connectionTest.success ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2">
              {connectionTest.success ? connectionTest.message : connectionTest.error}
            </Typography>
            {connectionTest.details && (
              <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                Details: {JSON.stringify(connectionTest.details, null, 2)}
              </Typography>
            )}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default SupabaseDebug;
