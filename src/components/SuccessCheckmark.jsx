import * as React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography } from '@mui/material';

export default function SuccessCheckmark({ message = 'Success!', size = 80 }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
      <CheckCircleIcon sx={{ fontSize: size, color: 'success.main', animation: 'pop 0.5s' }} />
      <Typography variant="h6" color="success.main" mt={1}>{message}</Typography>
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </Box>
  );
}
