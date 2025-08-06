
import React from 'react';
import { Typography, Box } from '@mui/material';

const CategoryPie = () => (
  <Box>
    <Typography variant="h6" fontWeight={600} mb={1} color="primary.main">
      Reports by Category
    </Typography>
    <img src="https://quickchart.io/chart?c={type:'pie',data:{labels:['Fire','Medical','Crime','Flood'],datasets:[{data:[8,5,3,4],backgroundColor:['#e53935','#43a047','#1976d2','#ffa000']}]} }" alt="Category Pie" style={{width:'100%',maxWidth:'220px',margin:'0 auto',display:'block',borderRadius:'10px'}} />
  </Box>
);

export default CategoryPie;
