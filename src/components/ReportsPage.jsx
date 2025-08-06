
import React from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const reportRows = [
  { id: 123, category: 'Fire', status: 'Active', date: '2025-08-07' },
  { id: 124, category: 'Medical', status: 'Resolved', date: '2025-08-07' },
];

const statusColor = status => {
  if (status === 'Active') return 'warning';
  if (status === 'Resolved') return 'success';
  return 'default';
};

const categoryColor = category => {
  if (category === 'Fire') return 'error';
  if (category === 'Medical') return 'success';
  if (category === 'Crime') return 'info';
  if (category === 'Flood') return 'primary';
  return 'default';
};

const ReportsPage = () => (
  <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 900, mx: 'auto' }}>
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={2} color="primary.main">
        All Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Reports table or list goes here. (Connect to Supabase for real data.)
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: 'rgba(25,118,210,0.07)' }}>
              <TableCell>ID</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportRows.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  <Chip label={row.category} color={categoryColor(row.category)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={row.status} color={statusColor(row.status)} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{row.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </Box>
);

export default ReportsPage;
