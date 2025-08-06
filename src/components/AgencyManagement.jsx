import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';



function AgencyManagement() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', contact: '' });

  useEffect(() => {
    setLoading(true);
    supabase.from('agencies').select('*').then(({ data, error }) => {
      if (error) setError(error.message);
      else setAgencies(data || []);
      setLoading(false);
    });
  }, []);

  const handleOpen = (idx = null) => {
    setEditIdx(idx);
    setForm(idx !== null ? agencies[idx] : { name: '', location: '', contact: '' });
    setOpen(true);
    setError('');
  };
  const handleClose = () => { setOpen(false); setEditIdx(null); setError(''); };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.location || !form.contact) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editIdx !== null) {
        const { error } = await supabase.from('agencies').update(form).eq('id', form.id);
        if (error) throw error;
        setAgencies(a => a.map((ag, i) => i === editIdx ? { ...ag, ...form } : ag));
      } else {
        const { data, error } = await supabase.from('agencies').insert([form]).select();
        if (error) throw error;
        setAgencies(a => [...a, ...(data || [])]);
      }
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to save agency.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async idx => {
    setLoading(true);
    setError('');
    try {
      const id = agencies[idx].id;
      const { error } = await supabase.from('agencies').delete().eq('id', id);
      if (error) throw error;
      setAgencies(a => a.filter((_, i) => i !== idx));
    } catch (err) {
      setError(err.message || 'Failed to delete agency.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 300 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" color="primary.main">Agencies</Typography>
        <Button variant="contained" onClick={() => handleOpen()} size="small">Add Agency</Button>
      </Box>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agencies.map((ag, idx) => (
              <TableRow key={ag.id}>
                <TableCell>{ag.name}</TableCell>
                <TableCell>{ag.location}</TableCell>
                <TableCell>{ag.contact}</TableCell>
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
        <DialogTitle>{editIdx !== null ? 'Edit Agency' : 'Add Agency'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
            <TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth required />
            <TextField label="Contact" name="contact" value={form.contact} onChange={handleChange} fullWidth required />
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

export default AgencyManagement;
