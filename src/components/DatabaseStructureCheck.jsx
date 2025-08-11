import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress
} from '@mui/material';
import { supabase } from '../supabaseClient';

function DatabaseStructureCheck() {
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkAgenciesStructure = async () => {
    setLoading(true);
    setError('');
    try {
      // Try a direct query to get sample data and check structure
      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select('*')
        .limit(3);
      
      if (agenciesError) throw agenciesError;
      
      if (agenciesData && agenciesData.length > 0) {
        const columns = Object.keys(agenciesData[0]);
        setTableInfo({ columns, sample: agenciesData });
      } else {
        setTableInfo({ columns: [], sample: null });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fixAgenciesData = async () => {
    setLoading(true);
    setError('');
    try {
      // Since RPC might not work, let's try direct SQL execution via a simpler approach
      // First, check if we can add the column
      const { error: addColumnError } = await supabase
        .from('agencies')
        .select('type')
        .limit(1);

      if (addColumnError && addColumnError.message.includes('does not exist')) {
        // Column doesn't exist, we need to add it manually through SQL editor
        setError('The type column needs to be added manually. Please run the SQL script provided below in your Supabase SQL Editor.');
        return;
      }

      // If we reach here, the column exists, so we just need to populate it
      const { data: agencies, error: fetchError } = await supabase
        .from('agencies')
        .select('*');

      if (fetchError) throw fetchError;

      // Update each agency with the correct type and name
      for (const agency of agencies) {
        const updates = {};
        
        // If the name field contains type codes, fix it
        if (['PNP', 'BFP', 'Hospital', 'MDRMMO', 'RHU'].includes(agency.name)) {
          updates.type = agency.name;
          updates.name = getProperAgencyName(agency.name);
          if (agency.location && typeof agency.location === 'string') {
            updates.address = agency.location;
            updates.location = null;
          }
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('agencies')
            .update(updates)
            .eq('id', agency.id);

          if (updateError) throw updateError;
        }
      }

      alert('Agencies data structure fixed successfully!');
      checkAgenciesStructure();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProperAgencyName = (type) => {
    switch (type) {
      case 'PNP': return 'Philippine National Police - Unisan';
      case 'BFP': return 'Bureau of Fire Protection - Unisan';
      case 'Hospital': return 'Unisan District Hospital';
      case 'MDRMMO': return 'Municipal Disaster Risk Reduction and Management Office';
      case 'RHU': return 'Rural Health Unit - Unisan';
      default: return type;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Database Structure Check
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={checkAgenciesStructure}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Check Agencies Table Structure
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tableInfo && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Agencies Table Columns:
            </Typography>
            
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Column Name</TableCell>
                  <TableCell>Sample Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableInfo.columns.map((column) => (
                  <TableRow key={column}>
                    <TableCell>{column}</TableCell>
                    <TableCell>
                      {tableInfo.sample ? String(tableInfo.sample[column] || 'NULL') : 'No data'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!tableInfo.columns.includes('type') && (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  The 'type' column is missing from the agencies table!
                  <br />
                  <strong>Note:</strong> Your current data structure stores the agency type in the 'name' column 
                  and the actual location in the 'location' column. This needs to be restructured.
                </Alert>
                <Button 
                  variant="contained" 
                  color="warning"
                  onClick={fixAgenciesData}
                  disabled={loading}
                >
                  Fix Agencies Data Structure
                </Button>
              </Box>
            )}

            {tableInfo.columns.includes('type') && (
              <Alert severity="success">
                The 'type' column exists in the agencies table.
              </Alert>
            )}

            {!tableInfo.columns.includes('type') && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Manual Fix - SQL Script
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Copy and run this SQL script in your Supabase SQL Editor:
                </Alert>
                <Box sx={{ 
                  background: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1, 
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  <pre>{`-- Fix for agencies table data structure
-- Add the type column if it doesn't exist
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('PNP', 'BFP', 'Hospital', 'MDRMMO', 'RHU', 'Other'));

-- Add a proper address column if it doesn't exist  
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Fix the data structure
UPDATE public.agencies 
SET 
  type = name,
  address = location,
  name = CASE 
    WHEN name = 'PNP' THEN 'Philippine National Police - Unisan'
    WHEN name = 'BFP' THEN 'Bureau of Fire Protection - Unisan'
    WHEN name = 'Hospital' THEN 'Unisan District Hospital'
    WHEN name = 'MDRMMO' THEN 'Municipal Disaster Risk Reduction and Management Office'
    WHEN name = 'RHU' THEN 'Rural Health Unit - Unisan'
    ELSE location
  END
WHERE type IS NULL;

-- Clear the location column (should be used for coordinates)
UPDATE public.agencies SET location = NULL;

-- Verify the changes
SELECT id, name, type, address, contact FROM public.agencies ORDER BY type;`}</pre>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default DatabaseStructureCheck;
