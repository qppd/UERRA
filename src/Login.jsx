
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Box, Paper, Typography, TextField, Button, Divider, CircularProgress, Avatar } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = ({ onLogin, footer }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthSuccess, setOauthSuccess] = useState(false);

  // Check for OAuth callback success
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    if (urlParams.get('access_token')) {
      setOauthSuccess(true);
      setError('');
    }
  }, []);

  const validate = () => {
    if (!email) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const { data, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (supaError) throw supaError;
      
      console.log('Email login successful:', data.user?.email);
      // Don't call onLogin immediately - let useAuthSession handle the state change
      // onLogin will be called by the useEffect in App.jsx when user state changes
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Determine the correct redirect URL
      let redirectTo;
      
      if (window.location.hostname === 'localhost') {
        // Development environment
        redirectTo = window.location.origin;
      } else if (window.location.hostname.includes('vercel.app')) {
        // Production environment - use the exact current origin
        redirectTo = window.location.origin;
      } else {
        // Fallback
        redirectTo = window.location.origin;
      }
      
      console.log('Starting Google OAuth with redirect:', redirectTo);
      
      const { data, error: supaError } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });
      
      if (supaError) {
        console.error('Supabase OAuth error:', supaError);
        throw supaError;
      }
      
      console.log('OAuth initiation successful');
      // Don't set loading to false here - let the OAuth flow complete
      // The auth state change will be handled by the useAuthSession hook
    } catch (err) {
      console.error('Google sign-in error:', err);
      const errorMessage = err.message || 'Google sign-in failed. Please try again.';
      setError(`${errorMessage} (Code: ${err.code || 'unknown'})`);
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 360, width: '100%', borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar sx={{ width: 56, height: 56, mb: 1 }} src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png" />
          <Typography variant="h5" fontWeight={500} mb={0.5} color="text.primary">Sign in</Typography>
          <Typography variant="body2" color="text.secondary" mb={2} align="center">to continue to UERRA</Typography>
        </Box>
        <form onSubmit={handleSubmit} autoComplete="off">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
            autoComplete="username"
            required
            disabled={loading}
            size="medium"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="current-password"
            required
            disabled={loading}
            size="medium"
          />
          {error && <Typography color="error" mt={1} mb={1} fontSize={14}>{error}</Typography>}
          {oauthSuccess && <Typography color="success.main" mt={1} mb={1} fontSize={14}>✅ Google sign-in successful! Redirecting...</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, mb: 1.5, fontWeight: 500, borderRadius: 2 }}
            disabled={loading}
            size="large"
            disableElevation
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Divider sx={{ my: 2 }}>or</Divider>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2 }}
            size="large"
          >
            Sign in with Google
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <>
              <Button
                type="button"
                variant="text"
                color="primary"
                fullWidth
                onClick={() => window.location.href = '/?debug=oauth'}
                sx={{ textTransform: 'none', fontSize: '12px', mt: 1 }}
                size="small"
              >
                Debug OAuth Issues
              </Button>
              <Button
                type="button"
                variant="text"
                color="secondary"
                fullWidth
                onClick={() => window.location.href = '/?test=production'}
                sx={{ textTransform: 'none', fontSize: '12px' }}
                size="small"
              >
                Production OAuth Test
              </Button>
            </>
          )}
          {footer && <Box mt={2}>{footer}</Box>}
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
