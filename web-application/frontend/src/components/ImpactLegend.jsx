import React from 'react';
import { Box, Grid } from '@mui/material';

const ImpactLegend = ({ readings }) => {
	return (
		<Grid container>
			{Object.values(readings).map((item, i) => (
				<Box key={i} sx={{ px: 1 }}>
					<span style={{ color: item.color, fontSize: 30 }}>●</span>
					<span>{item.name}</span>
				</Box>
			))}
		</Grid>
	);
};

export default ImpactLegend;
