import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function AdvancedAnalyticsLogs() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [reportUpdates, setReportUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [dateRange, selectedCategory]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Calculate date filter
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
      
      // Build query based on filters
      let reportsQuery = supabase
        .from('reports')
        .select(`
          *,
          categories(name, color),
          users(name, email, role)
        `)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        reportsQuery = reportsQuery.eq('category_id', selectedCategory);
      }

      const [reportsResult, categoriesResult, agenciesResult, usersResult, updatesResult] = await Promise.all([
        reportsQuery,
        supabase.from('categories').select('*'),
        supabase.from('agencies').select('*'),
        supabase.from('users').select('*'),
        supabase.from('report_updates').select(`
          *,
          users(name, email, role),
          reports(title, category_id)
        `).gte('created_at', daysAgo.toISOString()).order('created_at', { ascending: false })
      ]);

      if (reportsResult.error) throw reportsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (agenciesResult.error) throw agenciesResult.error;
      if (usersResult.error) throw usersResult.error;
      if (updatesResult.error) throw updatesResult.error;

      setReports(reportsResult.data || []);
      setCategories(categoriesResult.data || []);
      setAgencies(agenciesResult.data || []);
      setUsers(usersResult.data || []);
      setReportUpdates(updatesResult.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const calculateAnalytics = () => {
    // Basic stats
    const totalReports = reports.length;
    const resolvedReports = reports.filter(r => r.status === 'resolved').length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const activeUsers = new Set(reports.map(r => r.user_id)).size;

    // Average response time (hours)
    const resolvedWithTimes = reports.filter(r => 
      r.status === 'resolved' && 
      reportUpdates.some(u => u.report_id === r.id && u.status === 'acknowledged')
    );
    
    let avgResponseTime = 0;
    if (resolvedWithTimes.length > 0) {
      const totalTime = resolvedWithTimes.reduce((acc, report) => {
        const firstResponse = reportUpdates
          .filter(u => u.report_id === report.id && u.status === 'acknowledged')
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
        
        if (firstResponse) {
          const responseTime = (new Date(firstResponse.created_at) - new Date(report.created_at)) / (1000 * 60 * 60); // hours
          return acc + responseTime;
        }
        return acc;
      }, 0);
      avgResponseTime = totalTime / resolvedWithTimes.length;
    }

    // Reports by category
    const categoryStats = categories.map(cat => ({
      name: cat.name,
      count: reports.filter(r => r.category_id === cat.id).length,
      color: cat.color || COLORS[Math.floor(Math.random() * COLORS.length)]
    })).filter(stat => stat.count > 0);

    // Reports by status
    const statusStats = [
      { name: 'Pending', count: reports.filter(r => r.status === 'pending').length, color: '#FFBB28' },
      { name: 'Acknowledged', count: reports.filter(r => r.status === 'acknowledged').length, color: '#00C49F' },
      { name: 'In Progress', count: reports.filter(r => r.status === 'in_progress').length, color: '#0088FE' },
      { name: 'Resolved', count: reports.filter(r => r.status === 'resolved').length, color: '#00C49F' },
      { name: 'Cancelled', count: reports.filter(r => r.status === 'cancelled').length, color: '#FF8042' }
    ].filter(stat => stat.count > 0);

    // Daily reports trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const dayReports = reports.filter(r => r.created_at.startsWith(dayStr));
      
      dailyTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reports: dayReports.length,
        resolved: dayReports.filter(r => r.status === 'resolved').length
      });
    }

    // Priority distribution
    const priorityStats = [
      { name: 'Low', count: reports.filter(r => r.priority === 'low').length, color: '#00C49F' },
      { name: 'Medium', count: reports.filter(r => r.priority === 'medium').length, color: '#FFBB28' },
      { name: 'High', count: reports.filter(r => r.priority === 'high').length, color: '#FF8042' },
      { name: 'Critical', count: reports.filter(r => r.priority === 'critical').length, color: '#FF0000' }
    ].filter(stat => stat.count > 0);

    return {
      totalReports,
      resolvedReports,
      pendingReports,
      activeUsers,
      avgResponseTime,
      categoryStats,
      statusStats,
      dailyTrend,
      priorityStats,
      resolutionRate: totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : 0
    };
  };

  const analytics = calculateAnalytics();

  const exportData = async (format) => {
    try {
      const exportData = {
        reports: reports.map(r => ({
          id: r.id,
          title: r.title,
          category: categories.find(c => c.id === r.category_id)?.name,
          status: r.status,
          priority: r.priority,
          reporter: r.users?.name || r.users?.email,
          created_at: r.created_at,
          resolved_at: r.resolved_at,
          address: r.address
        })),
        analytics: {
          total_reports: analytics.totalReports,
          resolved_reports: analytics.resolvedReports,
          pending_reports: analytics.pendingReports,
          resolution_rate: analytics.resolutionRate,
          avg_response_time_hours: analytics.avgResponseTime.toFixed(2)
        }
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uerra-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      } else if (format === 'csv') {
        const csvContent = [
          'ID,Title,Category,Status,Priority,Reporter,Created Date,Address',
          ...exportData.reports.map(r => 
            `"${r.id}","${r.title || ''}","${r.category || ''}","${r.status}","${r.priority}","${r.reporter}","${r.created_at}","${r.address || ''}"`
          )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uerra-reports-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
      
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Analytics & Logs
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            System insights and activity logs
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            select
            size="small"
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="365">Last year</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {analytics.totalReports}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Reports
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {analytics.resolutionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolution Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {analytics.avgResponseTime.toFixed(1)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {analytics.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        {/* Daily Trend */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              Daily Reports Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reports" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Total Reports"
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              Reports by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              Priority Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.priorityStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity Logs */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" color="primary.main" mb={2}>
          Recent Activity Logs
        </Typography>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Report</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportUpdates.slice(0, 50).map((update) => (
                <TableRow key={update.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(update.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(update.created_at).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {update.users?.name || update.users?.email}
                    </Typography>
                    <Chip 
                      label={update.users?.role} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={update.status?.replace('_', ' ')} 
                      size="small" 
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {update.reports?.title || 'Emergency Report'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {update.notes || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Analytics Data</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Choose the format for exporting the analytics data and reports.
          </Typography>
          <Box display="flex" gap={2}>
            <Button 
              variant="outlined" 
              onClick={() => exportData('csv')}
              fullWidth
            >
              Export as CSV
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => exportData('json')}
              fullWidth
            >
              Export as JSON
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdvancedAnalyticsLogs;
