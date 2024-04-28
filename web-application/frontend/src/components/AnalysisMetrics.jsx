import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { List, ListItem, ListItemText, Switch, Divider, Box, Typography } from '@mui/material';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';

import backendClient from '../config/axiosConfig.js';
import { debounce } from '../utils.js';

export default function AnalysisMetrics() {
	const { repoID } = useParams();
	const [switches, setSwitches] = useState([]);

	useEffect(() => {
		const initSwitches = async () => {
			const { data } = await backendClient.get(`/api/settings/${repoID}?part=analysis_metrics`);
			setSwitches(data);
		};

		initSwitches();
	}, [repoID]);

	const debouncedUpdateSwitches = useRef(
		debounce(async (newSwitches) => {
			backendClient
				.put(`/api/settings/${repoID}?part=analysis_metrics`, newSwitches)
				.then(() => {
					enqueueSnackbar('Changes are successfully saved.', {
						variant: 'success',
					});
				})
				.catch(() => {
					enqueueSnackbar('There was an error. Please try again.', {
						variant: 'error',
					});
				});
		}, 1000)
	).current;

	const handleChange = async (event, index) => {
		const newSwitches = [...switches];
		newSwitches[index] = {
			...newSwitches[index],
			checked: event.target.checked,
		};
		setSwitches(newSwitches);

		// Call debounced function to update switches in the backend
		debouncedUpdateSwitches(newSwitches);
	};

	return (
		<Box border={1} borderColor='text.primary' sx={{ width: 5.5 / 10, ml: 10, mt: 10 }}>
			<Box display="flex" flexDirection="column" sx={{ alignItems: 'center' }}>
				<Typography variant='h6' sx={{ml:2}}>Analysis Metrics</Typography>
				<Typography variant='subtitle1' sx={{ml:2}}>Select metrics that should be shown in bot comments </Typography>
			</Box>
			<Divider />
			<List
				style={{
					width: '100%',
					maxHeight: 500,
					overflowY: 'scroll',
				}}
			>
				{switches.length > 0 &&
					switches.map(({ metric, checked }, index) => {
						return (
							<div key={index}>
								<ListItem key={index}>
									<ListItemText primary={metric} />
									<Switch
										checked={checked}
										onChange={(event) => handleChange(event, index)}
										edge='end'
									/>
								</ListItem>
								<Divider />
							</div>
						);
					})}
			</List>
			<SnackbarProvider
				maxSnack={3}
				anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
				autoHideDuration={4000}
			/>
		</Box>
	);
}
