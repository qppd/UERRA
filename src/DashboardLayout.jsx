
import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Avatar, 
  Divider, 
  useTheme, 
  useMediaQuery, 
  Fade,
  Switch,
  FormControlLabel,
  Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UerraLogo from './components/UerraLogo';

const iconMap = {
  'fa fa-home': <HomeIcon />,
  'fa fa-clipboard-list': <AssignmentIcon />,
  'fa fa-users-cog': <GroupIcon />,
  'fa fa-building': <BusinessIcon />,
  'fa fa-history': <HistoryIcon />,
  'fa fa-sign-out-alt': <LogoutIcon />,
};

function Sidebar({ links, open, onClose, currentPage, onNav, user, isCollapsed, onToggleCollapsed, darkMode, onToggleDarkMode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const sidebarWidth = isCollapsed ? 80 : 280;
  
  // Determine if this is a temporary drawer (mobile) or permanent drawer (desktop)
  const isTemporary = open !== undefined;
  
  const sidebarStyles = {
    '& .MuiDrawer-paper': {
      width: sidebarWidth,
      boxSizing: 'border-box',
      background: isDark 
        ? 'linear-gradient(145deg, #2d3748 0%, #1a202c 100%)'
        : 'linear-gradient(145deg, #ffffff 0%, #f7fafc 100%)',
      color: isDark ? '#ffffff' : '#2d3748',
      borderRadius: isCollapsed ? '0 20px 20px 0' : '0 24px 24px 0',
      border: 'none',
      boxShadow: isDark 
        ? '4px 0 20px rgba(0, 0, 0, 0.3)' 
        : '4px 0 20px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    },
  };

  return (
    <Drawer
      variant={isTemporary ? 'temporary' : 'permanent'}
      open={isTemporary ? open : true}
      onClose={onClose}
      ModalProps={{ 
        keepMounted: true,
        // Close sidebar when clicking outside (backdrop click) - only for temporary variant
        onBackdropClick: isTemporary ? onClose : undefined
      }}
      sx={sidebarStyles}
    >
      {/* Header with UERRA branding and user profile */}
      <Box sx={{ 
        p: isCollapsed ? 1.5 : 3, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        gap: 1,
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        minHeight: isCollapsed ? 80 : 120,
        transition: 'all 0.3s ease',
        justifyContent: 'center'
      }}>
        <UerraLogo 
          size={isCollapsed ? 'small' : 'medium'}
          showText={!isCollapsed}
          collapsed={isCollapsed}
        />
      </Box>

      {/* User Profile Section - Show on both mobile and desktop when expanded */}
      {(!isCollapsed || isTemporary) && user && (
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          background: isDark 
            ? 'rgba(255,255,255,0.02)' 
            : 'rgba(0,0,0,0.02)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                bgcolor: theme.palette.secondary.main,
                fontSize: '0.9rem'
              }}
            >
              {user.email?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                fontWeight={600}
                sx={{ 
                  color: isDark ? '#ffffff' : '#2d3748',
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize'
                }}
              >
                {user.user_metadata?.role || 'Citizen'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ flex: 1, p: isCollapsed ? 1 : 2 }}>
        {links.map(link => (
          <ListItemButton
            key={link.label}
            selected={currentPage === link.page}
            onClick={() => onNav(link.page)}
            sx={{
              borderRadius: 3,
              mx: 0,
              my: 0.5,
              minHeight: 48,
              px: isCollapsed ? 1 : 2,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              background: currentPage === link.page 
                ? `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}25)`
                : 'transparent',
              border: currentPage === link.page 
                ? `2px solid ${theme.palette.primary.main}40`
                : '2px solid transparent',
              color: currentPage === link.page 
                ? theme.palette.primary.main 
                : (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'),
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                background: currentPage === link.page
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.main}30)`
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                transform: 'translateX(4px)',
                color: currentPage === link.page 
                  ? theme.palette.primary.main 
                  : (isDark ? '#ffffff' : '#2d3748'),
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: 'inherit', 
                minWidth: isCollapsed ? 'auto' : 40,
                mr: isCollapsed ? 0 : 1,
                '& svg': {
                  fontSize: '1.3rem'
                }
              }}
            >
              {iconMap[link.icon] || <HomeIcon />}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary={link.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: currentPage === link.page ? 600 : 500,
                }}
              />
            )}
          </ListItemButton>
        ))}
      </List>

      {/* Bottom Section with Dark Mode Toggle */}
      <Box sx={{ 
        p: isCollapsed && !isTemporary ? 1 : 2, 
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        background: isDark 
          ? 'rgba(255,255,255,0.02)' 
          : 'rgba(0,0,0,0.02)'
      }}>
        {(!isCollapsed || isTemporary) ? (
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={onToggleDarkMode}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                    '& + .MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {darkMode ? <DarkModeIcon sx={{ fontSize: '1rem' }} /> : <LightModeIcon sx={{ fontSize: '1rem' }} />}
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </Typography>
              </Box>
            }
            sx={{
              margin: 0,
              '& .MuiFormControlLabel-label': {
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              }
            }}
          />
        ) : (
          <IconButton
            onClick={onToggleDarkMode}
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              width: '100%',
              borderRadius: 2,
              '&:hover': {
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              }
            }}
          >
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        )}
      </Box>

      {/* Collapse Toggle Button - Only show on desktop permanent sidebar */}
      {!isTemporary && (
        <IconButton
          onClick={onToggleCollapsed}
          sx={{
            position: 'absolute',
            top: '50%',
            right: isCollapsed ? -15 : -15,
            transform: 'translateY(-50%)',
            bgcolor: theme.palette.primary.main,
            color: 'white',
            width: 30,
            height: 30,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
            zIndex: 1,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          {isCollapsed ? <KeyboardArrowRightIcon sx={{ fontSize: '1rem' }} /> : <KeyboardArrowLeftIcon sx={{ fontSize: '1rem' }} />}
        </IconButton>
      )}
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


const DRAWER_WIDTH_EXPANDED = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

const DashboardLayout = ({ user, links, children, currentPage, onNav }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(theme.palette.mode === 'dark');

  const handleHamburger = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);
  const handleToggleCollapsed = () => setIsCollapsed(!isCollapsed);
  const handleToggleDarkMode = () => {
    // Use the global theme toggle function
    if (window.toggleTheme) {
      window.toggleTheme();
      setDarkMode(!darkMode);
    }
  };

  // Navigation handler that closes sidebar on mobile after navigation
  const handleNavigation = (page) => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    if (onNav) {
      onNav(page);
    }
  };

  // Sync dark mode state with theme
  useEffect(() => {
    setDarkMode(theme.palette.mode === 'dark');
  }, [theme.palette.mode]);

  // Auto-close mobile sidebar when screen size changes from mobile to desktop
  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  // Additional window resize listener for extra reliability
  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < theme.breakpoints.values.md;
      if (!isNowMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, theme.breakpoints.values.md]);

  const currentDrawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      {isMobile ? (
        /* Mobile: Temporary drawer that opens/closes with hamburger menu */
        <Sidebar 
          links={links} 
          open={sidebarOpen} 
          onClose={handleSidebarClose} 
          currentPage={currentPage} 
          onNav={handleNavigation}
          user={user}
          isCollapsed={false}
          onToggleCollapsed={() => {}}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      ) : (
        /* Desktop: Permanent drawer that can be collapsed/expanded */
        <Sidebar 
          links={links} 
          open={undefined} // undefined for permanent variant
          onClose={null} 
          currentPage={currentPage} 
          onNav={onNav}
          user={user}
          isCollapsed={isCollapsed}
          onToggleCollapsed={handleToggleCollapsed}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      )}
      
      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        ml: { xs: 0, md: `${currentDrawerWidth}px` }, // No margin on mobile, proper margin on desktop
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
        overflow: 'hidden' // Prevent horizontal overflow
      }}>
        <Navbar user={user} onHamburger={isMobile ? handleHamburger : null} />
        <Fade in>
          <Box component="main" sx={{ 
            flex: 1, 
            p: { 
              xs: '8px', 
              sm: '16px', 
              md: '24px',
              lg: '32px'
            },
            maxWidth: '100%',
            mx: 'auto', 
            width: '100%',
            transition: 'all 0.3s ease',
            overflowX: 'hidden', // Prevent horizontal scrolling
            overflowY: 'auto',   // Allow vertical scrolling when needed
            boxSizing: 'border-box'
          }}>
            <Box sx={{
              width: '100%',
              minHeight: 'calc(100vh - 140px)', // Account for navbar and footer
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1, sm: 2, md: 3 }
            }}>
              {children}
            </Box>
          </Box>
        </Fade>
        <Footer />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
