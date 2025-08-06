
import React from 'react';
import { Typography, Box } from '@mui/material';

const ReportsGraph = () => (
  <Box>
    <Typography variant="h6" fontWeight={600} mb={1} color="primary.main">
      Reports Over Time
    </Typography>
    <img src="https://quickchart.io/chart?c={type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Reports',data:[5,9,7,12,8,6,10],fill:true,backgroundColor:'rgba(25,118,210,0.12)',borderColor:'#1976d2'}]}}" alt="Reports Graph" style={{width:'100%',borderRadius:'10px'}} />
  </Box>
);

export default ReportsGraph;
