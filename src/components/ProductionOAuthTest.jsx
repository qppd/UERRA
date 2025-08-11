import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';

const ProductionOAuthTest = () => {
  const [logs, setLogs] = useState([]);
  const [environment, setEnvironment] = useState({});

  useEffect(() => {
    // Gather environment information
    const env = {
      hostname: window.location.hostname,
      origin: window.location.origin,
      href: window.location.href,
      userAgent: navigator.userAgent,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      isProduction: window.location.hostname !== 'localhost',
      isVercel: window.location.hostname.includes('vercel.app')
    };
    setEnvironment(env);
    addLog(`Environment detected: ${env.isProduction ? 'Production' : 'Development'}`, 'info');
    addLog(`Platform: ${env.isVercel ? 'Vercel' : 'Other'}`, 'info');
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const testProductionOAuth = async () => {
    addLog('Starting production OAuth test...', 'info');
    
    try {
      // Test with current environment
      const redirectTo = environment.origin;
      addLog(`Using redirect URL: ${redirectTo}`, 'info');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        addLog(`❌ OAuth Error: ${error.message}`, 'error');
        addLog(`Error Code: ${error.code}`, 'error');
        addLog(`Error Status: ${error.status}`, 'error');
        
        // Detailed analysis for code 500
        if (error.code === 500) {
          addLog('🔍 Error 500 Analysis:', 'warning');
          addLog('• This indicates a server-side configuration issue', 'warning');
          addLog('• Check Google OAuth Client ID/Secret in Supabase', 'warning');
          addLog('• Verify redirect URLs match between Google Console and Supabase', 'warning');
          addLog('• Ensure Google provider is enabled in Supabase', 'warning');
        }
        
        addLog(`Full error details: ${JSON.stringify(error, null, 2)}`, 'error');
      } else {
        addLog('✅ OAuth initiation successful!', 'success');
        addLog(`Response: ${JSON.stringify(data, null, 2)}`, 'success');
      }
    } catch (err) {
      addLog(`❌ Exception during OAuth test: ${err.message}`, 'error');
      addLog(`Stack trace: ${err.stack}`, 'error');
    }
  };

  const testSupabaseConnection = async () => {
    addLog('Testing Supabase connection...', 'info');
    
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`❌ Supabase connection failed: ${error.message}`, 'error');
      } else {
        addLog('✅ Supabase connection successful', 'success');
        addLog(`Session status: ${data.session ? 'Active' : 'No session'}`, 'info');
      }
    } catch (err) {
      addLog(`❌ Supabase connection exception: ${err.message}`, 'error');
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Production OAuth Tester
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Environment Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={environment.isProduction ? 'Production' : 'Development'} 
              color={environment.isProduction ? 'error' : 'success'} 
            />
            <Chip 
              label={environment.isVercel ? 'Vercel' : 'Local'} 
              color={environment.isVercel ? 'primary' : 'default'} 
            />
            <Chip 
              label={environment.hasSupabaseKey ? 'Supabase Configured' : 'Missing Config'} 
              color={environment.hasSupabaseKey ? 'success' : 'error'} 
            />
          </Box>
          
          <Typography variant="body2" component="div">
            <strong>Hostname:</strong> {environment.hostname}<br/>
            <strong>Origin:</strong> {environment.origin}<br/>
            <strong>Supabase URL:</strong> {environment.supabaseUrl}<br/>
            <strong>Current URL:</strong> {environment.href}
          </Typography>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          OAuth Tests
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={testSupabaseConnection}
          >
            Test Supabase Connection
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={testProductionOAuth}
          >
            Test Google OAuth
          </Button>
          
          <Button 
            variant="outlined"
            onClick={clearLogs}
          >
            Clear Logs
          </Button>
        </Box>
        
        {environment.isProduction && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Production Environment Detected</strong><br/>
            This test will help diagnose OAuth issues on your live deployment.
            Check browser console for additional details.
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Results
        </Typography>
        
        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
          {logs.length === 0 ? (
            <Typography color="text.secondary">
              No test results yet. Run a test above to see detailed information.
            </Typography>
          ) : (
            logs.map((log, index) => (
              <Alert 
                key={index} 
                severity={log.type} 
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" component="div">
                  <strong>[{log.timestamp}]</strong> 
                  <div style={{ marginTop: 4 }}>{log.message}</div>
                </Typography>
              </Alert>
            ))
          )}
        </Box>
      </Paper>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Expected OAuth Configuration
          </Typography>
          
          <Typography variant="body2" component="div">
            <strong>Google Cloud Console - Authorized JavaScript origins:</strong>
            <ul>
              <li>http://localhost:5173</li>
              <li>http://localhost:5174</li>
              <li>{environment.origin} (current)</li>
              <li>https://uerra.vercel.app</li>
            </ul>
            
            <strong>Google Cloud Console - Authorized redirect URIs:</strong>
            <ul>
              <li>https://bieexexscxkrshdvyuhj.supabase.co/auth/v1/callback</li>
              <li>{environment.origin}/auth/callback</li>
              <li>https://uerra.vercel.app/auth/callback</li>
            </ul>
            
            <strong>Supabase Configuration:</strong>
            <ul>
              <li>Site URL: {environment.origin}</li>
              <li>Redirect URLs: {environment.origin}/**</li>
              <li>Google provider: Enabled with valid Client ID and Secret</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductionOAuthTest;
