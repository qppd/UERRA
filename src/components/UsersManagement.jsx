import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Stack, MenuItem, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const roles = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'admin', label: 'Municipal Admin' },
  { value: 'agency', label: 'Agency' },
  { value: 'superadmin', label: 'Super Admin' }
];

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ email: '', name: '', role: '' });

  useEffect(() => {
    setLoading(true);
    supabase.from('users').select('*').then(({ data, error }) => {
      if (error) setError(error.message);
      else setUsers(data || []);
      setLoading(false);
    });
  }, []);

  const handleOpen = (idx = null) => {
    setEditIdx(idx);
    setForm(idx !== null ? users[idx] : { email: '', name: '', role: '' });
    setOpen(true);
    setError('');
  };
  const handleClose = () => { setOpen(false); setEditIdx(null); setError(''); };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.email || !form.name || !form.role) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editIdx !== null) {
        const { error } = await supabase.from('users').update(form).eq('id', form.id);
        if (error) throw error;
        setUsers(u => u.map((user, i) => i === editIdx ? { ...user, ...form } : user));
      } else {
        const { data, error } = await supabase.from('users').insert([form]).select();
        if (error) throw error;
        setUsers(u => [...u, ...(data || [])]);
      }
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to save user.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async idx => {
    setLoading(true);
    setError('');
    try {
      const id = users[idx].id;
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      setUsers(u => u.filter((_, i) => i !== idx));
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 300 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" color="primary.main">Users</Typography>
        <Button variant="contained" onClick={() => handleOpen()} size="small">Add User</Button>
      </Box>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, idx) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(idx)} size="small"><EditIcon fontSize="small" /></IconButton>
                  <IconButton onClick={() => handleDelete(idx)} size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editIdx !== null ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required />
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />

          <TextField label="Role" name="role" value={form.role} onChange={handleChange} fullWidth required />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  </Paper>
  );
}

export default UsersManagement;
