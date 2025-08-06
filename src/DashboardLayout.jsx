
import React, { useState } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, IconButton, Typography, Box, Avatar, Divider, useTheme, useMediaQuery, Fade } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';

const iconMap = {
  'fa fa-home': <HomeIcon />,
  'fa fa-clipboard-list': <AssignmentIcon />,
  'fa fa-users-cog': <GroupIcon />,
  'fa fa-building': <BusinessIcon />,
  'fa fa-history': <HistoryIcon />,
  'fa fa-sign-out-alt': <LogoutIcon />,
};

function Sidebar({ links, open, onClose, currentPage, onNav }) {
  const theme = useTheme();
  return (
    <Drawer
      variant={open ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          background: `linear-gradient(160deg, ${theme.palette.grey[900]} 70%, ${theme.palette.primary.main} 100%)`,
          color: '#fff',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1 }}>U</Avatar>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>UERRA</Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List>
        {links.map(link => (
          <ListItemButton
            key={link.label}
            selected={currentPage === link.page}
            onClick={() => onNav(link.page)}
            sx={{
              color: currentPage === link.page ? theme.palette.primary.main : '#fff',
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              background: currentPage === link.page ? 'rgba(255,255,255,0.08)' : 'none',
              '&:hover': { background: 'rgba(25,118,210,0.15)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
              {iconMap[link.icon] || <HomeIcon />}
            </ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

function Navbar({ user, onHamburger }) {
  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', zIndex: 1201 }}>
      <Toolbar>
        {onHamburger && (
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={onHamburger} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>Dashboard</Typography>
        {user && (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32 }}>{user.email?.[0]?.toUpperCase() || '?'}</Avatar>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

function Footer() {
  return (
    <Box component="footer" sx={{ textAlign: 'center', py: 2, color: 'text.secondary', fontSize: '0.98rem', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
      © {new Date().getFullYear()} Unisan Emergency Reporting and Response App
    </Box>
  );
}


const DRAWER_WIDTH = 240;

const DashboardLayout = ({ user, links, children, currentPage, onNav }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleHamburger = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Sidebar links={links} open={sidebarOpen} onClose={handleSidebarClose} currentPage={currentPage} onNav={p => { setSidebarOpen(false); onNav?.(p); }} />
      ) : (
        <Sidebar links={links} open={false} onClose={null} currentPage={currentPage} onNav={onNav} />
      )}
      {/* Main Content */}
      <Box sx={{ flex: 1, ml: { md: `${DRAWER_WIDTH}px` }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} onHamburger={isMobile ? handleHamburger : null} />
        <Fade in>
          <Box component="main" sx={{ flex: 1, p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1400, mx: 'auto', width: '100%' }}>
            {children}
          </Box>
        </Fade>
        <Footer />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
