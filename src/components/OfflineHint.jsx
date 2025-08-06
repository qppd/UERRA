import * as React from 'react';
import { Alert, Slide } from '@mui/material';

export default function OfflineHint() {
  const [offline, setOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handle = () => setOffline(!navigator.onLine);
    window.addEventListener('online', handle);
    window.addEventListener('offline', handle);
    return () => {
      window.removeEventListener('online', handle);
      window.removeEventListener('offline', handle);
    };
  }, []);

  return (
    <Slide direction="down" in={offline} mountOnEnter unmountOnExit>
      <Alert severity="warning" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 3000 }}>
        You are offline. Some features may be unavailable.
      </Alert>
    </Slide>
  );
}
