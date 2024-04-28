import React from 'react';
import { Typography, IconButton } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WarningAmberTwoToneIcon from '@mui/icons-material/WarningAmberTwoTone';
import GitHubIcon from '@mui/icons-material/GitHub';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const Status = ({ data }) => {
	let color;
	let text;
	let iconPart;

	if (data.color === '#FF6961') {
		color = '#FF6961';
		text = 'REMOVED';
		iconPart = <HighlightOffIcon sx={{ mr: 1, color }} />;
	} else if (data.color === '#FFA500') {
		color = '#FFA500';
		text = 'MODIFIED';
		iconPart = <EditIcon sx={{ mr: 1, color }} />;
	} else if (data.color === '#FFA500 #ADD8E6') {
		color = 'purple';
		text = 'MODIFIED & POSSIBLY AFFECTED';
		iconPart = <HelpOutlineIcon sx={{ mr: 1, color }} />;
	} else {
		color = 'lightblue';
		text = 'POSSIBLY AFFECTED';
		iconPart = <WarningAmberTwoToneIcon sx={{ mr: 1, color }} />;
	}

	return (
		<>
			<Grid item>{iconPart}</Grid>
			<Grid item>
				<Typography
					sx={{
						fontSize: 16,
						display: 'flex',
						alignItems: 'center',
						fontWeight: 'bold',
					}}
					color={color}
					gutterBottom
				>
					{text}
				</Typography>
			</Grid>
		</>
	);
};

const ImpactNodeContext = ({ data }) => {
	return (
		<Card sx={{ minWidth: 220 }} variant='flat'>
			<CardContent>
				<Grid container justifyContent='center'>
					<Status data={data} />
				</Grid>
				<Typography
					sx={{
						fontSize: 14,
						fontWeight: 'bold',
					}}
				>
					{data.packageName + '.' + data.className}
				</Typography>
				<Typography variant='body2'>{data.simplifiedSignature}</Typography>
				<Typography color='text.secondary'>{data.filePath}</Typography>

				<IconButton
					onClick={() =>
						window.open(
							`https://www.github.com/${data.projectIdentifier}/blob/${data.destinationBranchName}/${data.filePath}`
						)
					}
				>
					<GitHubIcon />
				</IconButton>
			</CardContent>
		</Card>
	);
};

export default ImpactNodeContext;
