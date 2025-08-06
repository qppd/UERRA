import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

export default function SkeletonLoader({ variant = 'rectangular', width = '100%', height = 60, count = 1 }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} width={width} height={height} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
}
