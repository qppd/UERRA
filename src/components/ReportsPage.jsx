

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const statusColor = status => {
  if (status === 'pending') return 'warning';
  if (status === 'accepted') return 'info';
  if (status === 'resolved') return 'success';
  return 'default';
};

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: reportsData, error: reportsError } = await supabase.from('reports').select('*');
        const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*');
        const { data: agenciesData, error: agenciesError } = await supabase.from('agencies').select('*');
        if (reportsError || categoriesError || agenciesError) throw new Error(reportsError?.message || categoriesError?.message || agenciesError?.message);
        setReports(reportsData || []);
        setCategories(categoriesData || []);
        setAgencies(agenciesData || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 300 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" color="primary.main">Reports</Typography>
        {/* You can add a button for adding reports if needed */}
      </Box>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow><TableCell colSpan={4}>No reports found.</TableCell></TableRow>
            ) : (
              reports.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Chip label={getCategoryName(row.category_id)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={row.status} color={statusColor(row.status)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{row.created_at ? row.created_at.split('T')[0] : ''}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}

export default ReportsPage;
