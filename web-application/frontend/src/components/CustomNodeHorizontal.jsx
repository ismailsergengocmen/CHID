import React, { memo } from 'react';
import { Handle } from 'reactflow';
import { Typography, Grid } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import ImpactNodeContext from './ImpactNodeContext';
import { styled } from '@mui/material/styles';
import AnchorIcon from '@mui/icons-material/Anchor';

const LightTooltip = styled(({ className, ...props }) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.common.white,
		color: 'rgba(0, 0, 0, 0.87)',
		boxShadow: theme.shadows[1],
		fontSize: 11,
	},
}));

function Select({ handleId, data }) {
	let info;
	let bgcolor;
	let bordercolor;

	if (data['deleted'] === true) {
		bgcolor = '#ff6961';
		bordercolor = bgcolor;
		info = (
			<Typography sx={{ fontSize: 11, bgcolor, px: 2 }}>
				{' '}
				{data['functionName']}{' '}
			</Typography>
		);
	} else if (data['changed'] === true && data['affected'] === false) {
		bgcolor = 'orange';
		bordercolor = bgcolor;
		info = (
			<Typography sx={{ fontSize: 11, bgcolor, px: 2 }}>
				{' '}
				{data['functionName']}{' '}
			</Typography>
		);
	} else if (data['changed'] === true && data['affected'] === true) {
		bgcolor =
			'linear-gradient(to right, rgba(255, 165, 0, 1), rgba(173, 216, 230, 1))';
		bordercolor = 'orange';
		info = (
			<Typography sx={{ fontSize: 11, background: bgcolor, px: 2 }}>
				{' '}
				{data['functionName']}{' '}
			</Typography>
		);
	} else {
		bgcolor = 'lightblue';
		bordercolor = bgcolor;
		info = (
			<Typography sx={{ fontSize: 11, bgcolor, px: 2 }}>
				{' '}
				{data['functionName']}
			</Typography>
		);
	}
	return (
		<div>
			<div
				className='custom-node__header'
				style={{ borderColor: bordercolor }}
			>
				<Typography
					noWrap
					sx={{ fontSize: 12, fontWeight: 'bold', px: 2 }}
				>
					{' '}
					{data.className}
				</Typography>
				{data.isTerminal ? (
					<Grid justifyContent='flex-end'>
						<AnchorIcon
							sx={{
								fontSize: 15,
								float: 'right',
								fontWeight: 'bold',
							}}
						/>
					</Grid>
				) : (
					''
				)}
			</div>
			{info}
			<Handle type='source' position='right' id={handleId} />
			<Handle type='target' position='left' id={handleId} />
		</div>
	);
}

function CustomNode({ data }) {
	return (
		<>
			<LightTooltip title={<ImpactNodeContext data={data} />} arrow>
				<div>
					<Select
						key={data}
						handleId={data.functionName}
						data={data}
					/>
				</div>
			</LightTooltip>
		</>
	);
}

export default memo(CustomNode);
