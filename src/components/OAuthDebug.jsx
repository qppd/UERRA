import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';

const OAuthDebug = () => {
  const [logs, setLogs] = useState([]);
  const [customRedirectUrl, setCustomRedirectUrl] = useState(window.location.origin);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const testSupabaseProviderConfig = async () => {
    addLog('Testing Supabase provider configuration...', 'info');
    
    try {
      // Try to get the OAuth URL directly
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'none', // Don't actually redirect, just test the config
          },
          skipBrowserRedirect: true // This should prevent actual redirect
        }
      });

      if (error) {
        addLog(`Provider config error: ${error.message}`, 'error');
        
        // Specific error analysis
        if (error.message.includes('Provider not found')) {
          addLog('Google provider is not enabled in Supabase Dashboard', 'error');
        } else if (error.message.includes('Invalid redirect URL')) {
          addLog('Redirect URL is not configured correctly in Supabase', 'error');
        } else if (error.code === 500) {
          addLog('Server error - likely OAuth credentials issue in Supabase', 'error');
        }
      } else {
        addLog('Provider configuration appears correct', 'success');
        if (data?.url) {
          addLog(`OAuth URL generated: ${data.url}`, 'info');
        }
      }
    } catch (err) {
      addLog(`Provider test failed: ${err.message}`, 'error');
    }
  };

  const testOAuthConfig = async () => {
    addLog('Testing OAuth configuration...', 'info');
    
    try {
      // Test basic Supabase connection
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`Session error: ${error.message}`, 'error');
      } else {
        addLog('Supabase connection successful', 'success');
      }

      // Check environment variables
      addLog(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`, 'info');
      addLog(`Current origin: ${window.location.origin}`, 'info');
      addLog(`Hostname: ${window.location.hostname}`, 'info');
      
    } catch (err) {
      addLog(`Configuration test failed: ${err.message}`, 'error');
    }
  };

  const testGoogleOAuth = async (redirectUrl) => {
    addLog(`Testing Google OAuth with redirect: ${redirectUrl}`, 'info');
    
    try {
      // First, check if we can connect to Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addLog(`Session check failed: ${sessionError.message}`, 'error');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        addLog(`OAuth error: ${error.message}`, 'error');
        addLog(`Error code: ${error.code || 'N/A'}`, 'error');
        addLog(`Error status: ${error.status || 'N/A'}`, 'error');
        
        // Enhanced error details for production debugging
        if (error.code === 500) {
          addLog('Error 500 suggests configuration issue between Supabase and Google', 'error');
          addLog('Check: 1) Google OAuth credentials 2) Redirect URLs 3) Supabase provider settings', 'info');
        }
        
        addLog(`Full error object: ${JSON.stringify(error, null, 2)}`, 'error');
      } else {
        addLog('OAuth initiation successful', 'success');
        addLog(`OAuth response: ${JSON.stringify(data, null, 2)}`, 'info');
      }
    } catch (err) {
      addLog(`OAuth test failed: ${err.message}`, 'error');
      addLog(`Error stack: ${err.stack}`, 'error');
    }
  };

  const clearLogs = () => setLogs([]);

  const handleTestWithCustomUrl = () => {
    testGoogleOAuth(customRedirectUrl);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        OAuth Debug Tool
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuration Test
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={testOAuthConfig}
          >
            Test Basic Config
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={testSupabaseProviderConfig}
          >
            Test Provider Config
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          OAuth Test
        </Typography>
        
        <TextField
          label="Custom Redirect URL"
          value={customRedirectUrl}
          onChange={(e) => setCustomRedirectUrl(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          helperText="Test with different redirect URLs"
        />
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => testGoogleOAuth(window.location.origin)}
          >
            Test with Current Origin
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => testGoogleOAuth('https://uerra.vercel.app')}
          >
            Test with Production URL
          </Button>
          
          <Button 
            variant="contained" 
            color="warning"
            onClick={() => testGoogleOAuth(`${window.location.origin}/auth/callback`)}
          >
            Test with Callback Path
          </Button>
          
          <Button 
            variant="outlined"
            onClick={handleTestWithCustomUrl}
          >
            Test Custom URL
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>Current Environment:</strong> {window.location.hostname === 'localhost' ? 'Development' : 'Production'}<br/>
          <strong>Current URL:</strong> {window.location.href}<br/>
          <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Debug Logs
          </Typography>
          <Button variant="outlined" size="small" onClick={clearLogs}>
            Clear Logs
          </Button>
        </Box>
        
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {logs.length === 0 ? (
            <Typography color="text.secondary">
              No logs yet. Run a test to see debug information.
            </Typography>
          ) : (
            logs.map((log, index) => (
              <Alert 
                key={index} 
                severity={log.type} 
                sx={{ mb: 1 }}
              >
                <Typography variant="body2">
                  <strong>[{log.timestamp}]</strong> {log.message}
                </Typography>
              </Alert>
            ))
          )}
        </Box>
      </Paper>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Common OAuth Issues & Solutions
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Error 500 "unexpected_failure":</strong>
          </Typography>
          <ul>
            <li>Check Google OAuth configuration in Supabase Dashboard</li>
            <li>Verify redirect URLs are properly configured</li>
            <li>Ensure Google Cloud Console has correct authorized origins</li>
            <li>Check if the OAuth client is properly configured</li>
          </ul>
          
          <Typography variant="body2" paragraph>
            <strong>Steps to fix in Supabase:</strong>
          </Typography>
          <ol>
            <li>Go to Authentication → Providers → Google</li>
            <li>Check that Client ID and Client Secret are correct</li>
            <li>Verify Site URL and Redirect URLs</li>
            <li>Ensure the provider is enabled</li>
          </ol>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OAuthDebug;
