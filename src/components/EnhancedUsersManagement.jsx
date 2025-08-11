import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Stack, 
  MenuItem, 
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  SupervisorAccount as SuperAdminIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';

const roles = [
  { value: 'citizen', label: 'Citizen', icon: <PeopleIcon />, color: 'default' },
  { value: 'admin', label: 'Municipal Admin', icon: <AdminIcon />, color: 'primary' },
  { value: 'agency', label: 'Agency', icon: <BusinessIcon />, color: 'secondary' },
  { value: 'superadmin', label: 'Super Admin', icon: <SuperAdminIcon />, color: 'error' }
];

function EnhancedUsersManagement() {
  const [users, setUsers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ 
    email: '', 
    name: '', 
    role: 'citizen', 
    agency_id: '',
    phone: '',
    address: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchAgencies();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First try to get users with agency type, if it fails, fall back to name only
      let { data, error } = await supabase
        .from('users')
        .select(`
          *,
          agencies(name, type)
        `)
        .order('created_at', { ascending: false });
      
      // If error due to missing type column, try again without type
      if (error && error.message.includes('does not exist')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .select(`
            *,
            agencies(name)
          `)
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        data = fallbackData;
      } else if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAgencies(data || []);
    } catch (err) {
      console.error('Error fetching agencies:', err);
    }
  };

  const handleOpen = (idx = null) => {
    setEditIdx(idx);
    setForm(idx !== null ? {
      ...users[idx],
      agency_id: users[idx].agency_id || '',
      phone: users[idx].phone || '',
      address: users[idx].address || '',
      is_active: users[idx].is_active !== false
    } : { 
      email: '', 
      name: '', 
      role: 'citizen', 
      agency_id: '',
      phone: '',
      address: '',
      is_active: true
    });
    setOpen(true);
    setError('');
  };

  const handleClose = () => { 
    setOpen(false); 
    setEditIdx(null); 
    setError(''); 
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.email || !form.name || !form.role) {
      setError('Email, name, and role are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        email: form.email,
        name: form.name,
        role: form.role,
        agency_id: form.agency_id || null,
        phone: form.phone || null,
        address: form.address || null,
        is_active: form.is_active
      };

      if (editIdx !== null) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', form.id);
          
        if (error) throw error;
        
        setUsers(u => u.map((user, i) => 
          i === editIdx ? { ...user, ...userData } : user
        ));
      } else {
        // Create new user - in production, this would use Supabase Auth Admin API
        let { data, error } = await supabase
          .from('users')
          .insert([{ 
            ...userData,
            id: crypto.randomUUID() // Temporary for demo
          }])
          .select(`
            *,
            agencies(name, type)
          `);
          
        // If error due to missing type column, try again without type
        if (error && error.message.includes('does not exist')) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('users')
            .insert([{ 
              ...userData,
              id: crypto.randomUUID() // Temporary for demo
            }])
            .select(`
              *,
              agencies(name)
            `);
          
          if (fallbackError) throw fallbackError;
          data = fallbackData;
        } else if (error) {
          throw error;
        }
        
        setUsers(u => [...(data || []), ...u]);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to save user.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async idx => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      const id = users[idx].id;
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setUsers(u => u.filter((_, i) => i !== idx));
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (idx) => {
    const user = users[idx];
    const newStatus = !user.is_active;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setUsers(u => u.map((user, i) => 
        i === idx ? { ...user, is_active: newStatus } : user
      ));
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    }
  };

  // Filter users based on current tab and search
  const getFilteredUsers = () => {
    let filtered = users;
    
    // Filter by role tab
    if (currentTab > 0) {
      const targetRole = roles[currentTab - 1].value;
      filtered = filtered.filter(user => user.role === targetRole);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.agencies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active !== false).length,
    citizens: users.filter(u => u.role === 'citizen').length,
    admins: users.filter(u => u.role === 'admin').length,
    agencies: users.filter(u => u.role === 'agency').length,
    superAdmins: users.filter(u => u.role === 'superadmin').length
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  const filteredUsers = getFilteredUsers();

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          User Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage system users, roles, and permissions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.citizens}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Citizens
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.agencies}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Agencies
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                  <AdminIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.admins + stats.superAdmins}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admins
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        {/* Controls */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
            />
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  All Users
                  <Chip label={stats.total} size="small" />
                </Box>
              }
            />
            {roles.map((role, index) => (
              <Tab 
                key={role.value}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {role.icon}
                    {role.label}
                    <Chip 
                      label={stats[role.value === 'citizen' ? 'citizens' : 
                             role.value === 'admin' ? 'admins' :
                             role.value === 'agency' ? 'agencies' : 'superAdmins']} 
                      size="small" 
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading users...</Typography>
          ) : filteredUsers.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No users found.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Agency</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user, idx) => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: `${roleInfo.color}.main`, width: 40, height: 40 }}>
                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.name || 'No Name'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={roleInfo.icon}
                          label={roleInfo.label} 
                          size="small" 
                          color={roleInfo.color}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {user.agencies?.name ? (
                          <Box>
                            <Typography variant="body2">
                              {user.agencies.name}
                            </Typography>
                            {user.agencies.type && (
                              <Typography variant="caption" color="text.secondary">
                                {user.agencies.type}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          {user.phone && (
                            <Typography variant="body2">
                              <PhoneIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                              {user.phone}
                            </Typography>
                          )}
                          {user.address && (
                            <Typography variant="caption" color="text.secondary">
                              <LocationIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                              {user.address}
                            </Typography>
                          )}
                          {!user.phone && !user.address && (
                            <Typography color="text.secondary">-</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_active !== false ? 'Active' : 'Inactive'} 
                          size="small" 
                          color={user.is_active !== false ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(user.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit User">
                          <IconButton 
                            onClick={() => handleOpen(idx)} 
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.is_active !== false ? 'Deactivate' : 'Activate'}>
                          <IconButton 
                            onClick={() => toggleUserStatus(idx)} 
                            size="small"
                            color={user.is_active !== false ? 'warning' : 'success'}
                          >
                            {user.is_active !== false ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton 
                            onClick={() => handleDelete(idx)} 
                            size="small" 
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editIdx !== null ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Email" 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                fullWidth 
                required 
                disabled={editIdx !== null}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Full Name" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                select
                label="Role" 
                name="role" 
                value={form.role} 
                onChange={handleChange} 
                fullWidth 
                required
              >
                {roles.map(role => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {role.icon}
                      {role.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {(form.role === 'agency' || form.role === 'admin') && (
              <Grid item xs={12} md={6}>
                <TextField 
                  select
                  label="Agency" 
                  name="agency_id" 
                  value={form.agency_id} 
                  onChange={handleChange} 
                  fullWidth
                >
                  <MenuItem value="">No Agency</MenuItem>
                  {agencies.map(agency => (
                    <MenuItem key={agency.id} value={agency.id}>
                      {agency.name} ({agency.type})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField 
                label="Phone Number" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Address" 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    name="is_active"
                  />
                }
                label="Active User"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {editIdx !== null ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EnhancedUsersManagement;
