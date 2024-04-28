import React from 'react';
import { Box, Button, Alert, AlertTitle } from '@mui/material';
import ImpactGraphGraphin from '../components/ImpactGraphGraphin';
import ImpactGraphG6 from '../components/ImpactGraphG6';
import ImpactLegend from '../components/ImpactLegend';

export default function Impact() {
	return (
		<>
			<Box display='flex' flexDirection={'column'} sx={{ width: `calc(100% - 13%)`, ml: `13%` }}>
				{/* <Box sx={{display: "flex", justifyContent: "center", my:"1%" }}>
          <Alert severity="info">
            <AlertTitle><strong>Impact Page</strong></AlertTitle>
            You can see impact graph of the pull request in this page. The impact graph only
            <br/>includes Java files. You can filter the functions with the impact level and rotate the graph 
            <br/><strong>Click on a function to see detailed information</strong>
          </Alert>
        </Box> */}
				<Box sx={{ display: 'flex', justifyContent: 'center', my: '1%' }}>
					<ImpactGraphG6 />
				</Box>
			</Box>
		</>
	);
}
