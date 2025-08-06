

import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

function Main() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
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
