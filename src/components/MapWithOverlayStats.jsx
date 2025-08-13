import React from 'react';
import { Box, Paper, Typography, Avatar, useTheme } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapWidget from './MapWidget';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function getTodayISO() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

const MapWithOverlayStats = () => {
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
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map as background */}
      <Box sx={{ width: '100%', height: '100%' }}>
        <MapWidget />
      </Box>
      
      {/* Stats Cards Overlay - Bottom Position */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 12, sm: 16, md: 20 },
          left: { xs: 12, sm: 16, md: 20 },
          right: { xs: 12, sm: 16, md: 20 },
          zIndex: 1000,
          pointerEvents: 'none', // Allow map interaction through overlay
        }}
      >
        <Box 
          display="grid"
          gridTemplateColumns={{ 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(4, 1fr)'
          }}
          gap={{ xs: 1, sm: 1.5, md: 2 }}
          sx={{
            pointerEvents: 'auto', // Re-enable pointer events for cards
          }}
        >
          {cards.map(s => (
            <Paper 
              key={s.label} 
              elevation={3}
              sx={{ 
                p: { xs: 0.75, sm: 1, md: 1.25 }, 
                borderRadius: { xs: 1.5, md: 2 }, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                borderBottom: `2px solid ${theme.palette[s.color.split('.')[0]][s.color.split('.')[1]]}`,
                minHeight: { xs: 60, sm: 70, md: 80 },
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 30, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(40, 40, 40, 0.98)' 
                    : 'rgba(255, 255, 255, 0.98)',
                }
              }}
            >
              <Avatar sx={{ 
                bgcolor: theme.palette[s.color.split('.')[0]][s.color.split('.')[1]], 
                width: { xs: 20, sm: 24, md: 28 }, 
                height: { xs: 20, sm: 24, md: 28 }, 
                mb: { xs: 0.25, sm: 0.5, md: 0.5 },
                '& svg': {
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                }
              }}>
                {s.icon}
              </Avatar>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                color="text.primary"
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  textAlign: 'center',
                  lineHeight: 1
                }}
              >
                {s.value}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.65rem' },
                  textAlign: 'center',
                  lineHeight: 1.1,
                  mt: 0.1
                }}
              >
                {s.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MapWithOverlayStats;
