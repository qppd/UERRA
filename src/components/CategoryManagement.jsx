import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ name: '', agencies: '', tips: '', equipment: '' });

  // Fetch categories (Read)
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*');
    if (error) setError(error.message);
    else setCategories(
      (data || []).map(cat => ({
        ...cat,
        agencies: cat.assigned_agencies,
        tips: cat.emergency_tips,
        equipment: cat.suggested_equipment,
      }))
    );
    setLoading(false);
  };

  // Fetch categories and agencies on mount
  useEffect(() => {
    fetchCategories();
    supabase.from('agencies').select('*').then(({ data, error }) => {
      if (!error) setAgencies(data || []);
    });
  }, []);
  // Helper to get agency names from UUIDs
  const getAgencyNames = (ids) => {
    if (!Array.isArray(ids)) return '';
    return ids
      .map(id => {
        const agency = agencies.find(a => a.id === id);
        return agency ? agency.name : id;
      })
      .join(', ');
  };

  // Reset form state
  const resetForm = () => setForm({ name: '', agencies: '', tips: '', equipment: '' });

  const handleOpen = (idx = null) => {
    setEditIdx(idx);
    setForm(idx !== null ? {
      ...categories[idx],
      agencies: Array.isArray(categories[idx].agencies) ? categories[idx].agencies.join(', ') : '',
      tips: Array.isArray(categories[idx].tips) ? categories[idx].tips.join(', ') : '',
      equipment: Array.isArray(categories[idx].equipment) ? categories[idx].equipment.join(', ') : '',
    } : { name: '', agencies: '', tips: '', equipment: '' });
    setOpen(true);
    setError('');
  };
  const handleClose = () => { setOpen(false); setEditIdx(null); setError(''); resetForm(); };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Create & Update
  const handleSave = async () => {
    if (!form.name) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        agencies: form.agencies ? form.agencies.split(',').map(s => s.trim()) : [],
        tips: form.tips ? form.tips.split(',').map(s => s.trim()) : [],
        equipment: form.equipment ? form.equipment.split(',').map(s => s.trim()) : [],
      };
      if (editIdx !== null) {
        // Update
        const { error } = await supabase.from('categories').update(payload).eq('id', categories[editIdx].id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from('categories').insert([payload]);
        if (error) throw error;
      }
      await fetchCategories();
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async idx => {
    setLoading(true);
    setError('');
    try {
      const id = categories[idx].id;
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to delete category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 300 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" color="primary.main">Categories</Typography>
        <Button variant="contained" onClick={() => handleOpen()} size="small">Add Category</Button>
      </Box>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Agencies</TableCell>
              <TableCell>Tips</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat, idx) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{getAgencyNames(cat.agencies)}</TableCell>
                <TableCell>{Array.isArray(cat.tips) ? cat.tips.join(', ') : ''}</TableCell>
                <TableCell>{Array.isArray(cat.equipment) ? cat.equipment.join(', ') : ''}</TableCell>
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
        <DialogTitle>{editIdx !== null ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
            <TextField label="Agencies (comma separated)" name="agencies" value={form.agencies} onChange={handleChange} fullWidth />
            <TextField label="Tips (comma separated)" name="tips" value={form.tips} onChange={handleChange} fullWidth />
            <TextField label="Equipment (comma separated)" name="equipment" value={form.equipment} onChange={handleChange} fullWidth />
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

export default CategoryManagement;
