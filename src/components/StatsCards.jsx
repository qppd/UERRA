
import React from 'react';
import { Paper, Box, Typography, Avatar, useTheme } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const stats = [
  { label: 'Active Reports', value: 12, icon: <NotificationsActiveIcon />, color: 'primary.main' },
  { label: 'Responders Online', value: 7, icon: <SecurityIcon />, color: 'success.main' },
  { label: 'Avg. Response Time', value: '5m', icon: <AccessTimeIcon />, color: 'warning.main' },
  { label: 'Resolved Today', value: 21, icon: <CheckCircleIcon />, color: 'success.dark' },
];

const StatsCards = () => {
  const theme = useTheme();
  return (
    <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
      {stats.map(s => (
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
