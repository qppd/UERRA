

import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Avatar, useTheme } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from '../supabaseClient';

function getTodayISO() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

const StatsCards = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    activeReports: 0,
    respondersOnline: 0,
    avgResponseTime: '-',
    resolvedToday: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Active Reports (status: pending or accepted)
      const { count: activeCount } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'accepted']);

      // Responders Online (users with role: agency, status: online)
      const { count: respondersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'agency')
        .eq('online', true);

      // Avg. Response Time (for resolved reports today)
      const today = getTodayISO();
      const { data: resolvedReports } = await supabase
        .from('reports')
        .select('created_at, resolved_at')
        .eq('status', 'resolved')
        .gte('resolved_at', today);
      let avgResponse = '-';
      if (resolvedReports && resolvedReports.length > 0) {
        const times = resolvedReports
          .map(r => (new Date(r.resolved_at) - new Date(r.created_at)) / 60000)
          .filter(t => t > 0);
        if (times.length > 0) {
          const avg = times.reduce((a, b) => a + b, 0) / times.length;
          avgResponse = `${Math.round(avg)}m`;
        }
      }

      // Resolved Today
      const { count: resolvedTodayCount } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'resolved')
        .gte('resolved_at', today);

      setStats({
        activeReports: activeCount || 0,
        respondersOnline: respondersCount || 0,
        avgResponseTime: avgResponse,
        resolvedToday: resolvedTodayCount || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Active Reports', value: stats.activeReports, icon: <NotificationsActiveIcon />, color: 'primary.main' },
    { label: 'Responders Online', value: stats.respondersOnline, icon: <SecurityIcon />, color: 'success.main' },
    { label: 'Avg. Response Time', value: stats.avgResponseTime, icon: <AccessTimeIcon />, color: 'warning.main' },
    { label: 'Resolved Today', value: stats.resolvedToday, icon: <CheckCircleIcon />, color: 'success.dark' },
  ];

  return (
    <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
      {cards.map(s => (
        <Paper key={s.label} elevation={1} sx={{ p: 2, minWidth: 160, flex: 1, maxWidth: 220, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: `3px solid ${theme.palette[s.color.split('.')[0]][s.color.split('.')[1]]}` }}>
          <Avatar sx={{ bgcolor: theme.palette[s.color.split('.')[0]][s.color.split('.')[1]], width: 48, height: 48, mb: 1 }}>
            {s.icon}
          </Avatar>
          <Typography variant="h5" fontWeight={700} color="text.primary">{s.value}</Typography>
          <Typography variant="body2" color="text.secondary">{s.label}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default StatsCards;
