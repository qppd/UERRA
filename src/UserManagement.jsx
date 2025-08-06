
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { upsertUserProfile } from './useUserProfile';
import { Box, Paper, Typography, TextField, MenuItem, Button, Alert, Stack, CircularProgress } from '@mui/material';

const roles = [
  { value: 'admin', label: 'Municipal Admin' },
  { value: 'agency', label: 'Agency' },
  { value: 'superadmin', label: 'Super Admin' },
];

const UserManagement = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [agency, setAgency] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password || !role || ((role === 'agency' || role === 'admin') && !agency)) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: supaError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (supaError) throw supaError;
      if (data.user) {
        await upsertUserProfile({
          id: data.user.id,
          email,
          role,
          agency_id: (role === 'agency' || role === 'admin') ? agency : null,
        });
      }
      setSuccess('User created successfully!');
      setEmail(''); setPassword(''); setRole('admin'); setAgency('');
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 3 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" mb={1}>
          User Management <Typography component="span" variant="body2" color="text.secondary">(Super Admin Only)</Typography>
        </Typography>
        <Box component="form" onSubmit={handleCreate} autoComplete="off" sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Role"
              select
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              disabled={loading}
              fullWidth
            >
              {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
            {(role === 'agency' || role === 'admin') && (
              <TextField
                label="Agency"
                value={agency}
                onChange={e => setAgency(e.target.value)}
                required
                disabled={loading}
                fullWidth
              />
            )}
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth size="large" startIcon={loading ? <CircularProgress size={20} /> : null}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserManagement;
