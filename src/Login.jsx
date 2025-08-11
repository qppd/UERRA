
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Box, Paper, Typography, TextField, Button, Divider, CircularProgress, Avatar } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = ({ onLogin, footer }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      onLogin && onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: supaError } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: 'https://uerra.vercel.app'
        }
      });
      if (supaError) throw supaError;
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
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
          {footer && <Box mt={2}>{footer}</Box>}
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
