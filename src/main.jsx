

import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import './ResponsiveGlobal.css';

function Main() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  
  // Make toggle function available globally
  React.useEffect(() => {
    window.toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode]);
  
  const theme = useMemo(
    () =>
      createTheme({
        palette: { 
          mode,
          primary: {
            main: '#d32f2f', // Emergency red
            light: '#ff6659',
            dark: '#9a0007',
          },
          secondary: {
            main: '#0d47a1', // Navy blue
            light: '#5472d3',
            dark: '#002171',
          },
        },
        shape: { borderRadius: 12 },
        breakpoints: {
          values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          // Responsive typography
          h1: {
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          },
          h2: {
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
          },
          h3: {
            fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
          },
          h4: {
            fontSize: 'clamp(1.25rem, 3vw, 2rem)',
          },
          h5: {
            fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
          },
          h6: {
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          },
          body1: {
            fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
          },
          body2: {
            fontSize: 'clamp(0.8rem, 1.2vw, 0.875rem)',
          },
        },
        components: {
          MuiButton: { 
            styleOverrides: { 
              root: { 
                textTransform: 'none',
                borderRadius: 8,
                fontWeight: 500,
              } 
            } 
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiContainer: {
            styleOverrides: {
              root: {
                paddingLeft: '8px',
                paddingRight: '8px',
                '@media (min-width: 600px)': {
                  paddingLeft: '16px',
                  paddingRight: '16px',
                },
                '@media (min-width: 960px)': {
                  paddingLeft: '24px',
                  paddingRight: '24px',
                },
              },
            },
          },
          MuiGrid: {
            styleOverrides: {
              container: {
                width: '100%',
                margin: 0,
              },
            },
          },
          MuiTableContainer: {
            styleOverrides: {
              root: {
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 4,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: 12,
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [mode]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <button
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 2000,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 24,
          color: 'inherit',
        }}
        aria-label="Toggle dark mode"
      >
        {mode === 'dark' ? '🌙' : '☀️'}
      </button>
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);
