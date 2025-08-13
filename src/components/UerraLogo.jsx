import React from 'react';
import { Box, Typography } from '@mui/material';

const UerraLogo = ({ size = 'medium', showText = true, collapsed = false }) => {
  const logoSize = size === 'small' ? 32 : size === 'large' ? 56 : 40;
  const textSize = size === 'small' ? '0.9rem' : size === 'large' ? '1.3rem' : '1.1rem';
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: collapsed ? 0 : 1.5,
      transition: 'all 0.3s ease'
    }}>
      {/* UERRA Emergency Icon */}
      <Box
        sx={{
          width: logoSize,
          height: logoSize,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 50%, #0d47a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            borderRadius: '50%',
          }
        }}
      >
        <Typography
          sx={{
            color: 'white',
            fontWeight: 900,
            fontSize: size === 'small' ? '1rem' : size === 'large' ? '1.5rem' : '1.2rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 1,
          }}
        >
          U
        </Typography>
      </Box>
      
      {/* UERRA Text */}
      {showText && !collapsed && (
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: textSize,
              background: 'linear-gradient(45deg, #d32f2f, #0d47a1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '1px',
              lineHeight: 1.2,
            }}
          >
            UERRA
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontSize: '0.7rem',
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: '0.5px',
              opacity: 0.8,
              mt: -0.5,
            }}
          >
            Emergency Response
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UerraLogo;
