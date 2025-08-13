

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
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Paper elevation={2} sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 }, 
        borderRadius: { xs: 2, md: 3 }, 
        minHeight: 300,
        width: '100%'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h6" color="primary.main" sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            Reports
          </Typography>
          {/* You can add a button for adding reports if needed */}
        </Box>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <TableContainer sx={{ 
            width: '100%', 
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: { xs: 300, sm: 600 }
            }
          }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', sm: 'table-cell' }
                  }}>
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map(row => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {row.id}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getCategoryName(row.category_id)} 
                          size="small" 
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                            maxWidth: { xs: '80px', sm: 'none' },
                            '& .MuiChip-label': {
                              px: { xs: 1, sm: 1.5 }
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          color={statusColor(row.status)} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                            '& .MuiChip-label': {
                              px: { xs: 1, sm: 1.5 }
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', sm: 'table-cell' }
                      }}>
                        {row.created_at ? row.created_at.split('T')[0] : ''}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default ReportsPage;
