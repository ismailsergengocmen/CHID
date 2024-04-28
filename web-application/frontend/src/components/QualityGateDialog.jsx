import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField, Typography, Box, Divider } from '@mui/material';
import backendClient from '../config/axiosConfig';

const metrics = [
	{ value: 'risk_score', label: 'Risk Score' },
	{ value: 'highly_churn_file', label: 'High Churn File Count' },
	{ value: 'highly_buggy_file', label: 'Highly Buggy File Count' },
	{ value: 'pr_size', label: 'Pull Request Size' },
];

const QualityGateDialog = ({ type, open, setOpen, currMetric, currValue, initQualityGate, enqueueSnackbar }) => {
	const [metric, setMetric] = useState(currMetric);
	const [value, setValue] = useState(currValue);

	const { repoID } = useParams();

	const handleClick = async () => {
		let apiCall;

		if (type === 'add') {
			apiCall = backendClient.post(`/api/settings/quality_gate/${repoID}`, {
				metric_name: metric,
				threshold: value,
			});
		} else if (type === 'edit') {
			apiCall = backendClient.put(`/api/settings/quality_gate/${repoID}`, {
				old: {
					metric_name: currMetric,
					threshold: currValue,
				},
				new: { metric_name: metric, threshold: value },
			});
		}

		try {
			await apiCall;
			enqueueSnackbar(`Condition is successfully ${type === 'add' ? 'added' : 'edited'}.`, {
				variant: 'success',
			});
			await initQualityGate();
			handleClose();
		} catch (err) {
			enqueueSnackbar('There was an error. Please try again.', {
				variant: 'error',
			});
		}
	};

	const handleClose = () => {
		setOpen(false);
		setMetric(currMetric);
		setValue(currValue);
	};

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle id='alert-dialog-title'>
				{type === 'add' ? 'Add Quality Gate Condition' : 'Edit Quality Gate Condition'}
			</DialogTitle>
			<Divider orientation='horizontal' />
			<DialogContent>
				<Box style={{ width: '60%', marginTop: "10"}}>
					<Box display='flex' flexDirection='row' sx={{ml: 2}}>
						<Typography variant='h6' gutterBottom sx={{mt: 1}}>
							Metric
						</Typography>
						<Select
							labelId='demo-simple-select-label'
							id='demo-simple-select'
							value={metric}
							label='Code Churn'
							onChange={(event) => setMetric(event.target.value)}
							style={{ marginLeft: '10px' }}
						>
							{metrics.map((quality) => {
								return <MenuItem value={quality.value}>{quality.label}</MenuItem>;
							})}
						</Select>
					</Box>
					<Box display='flex' flexDirection='row' sx={{mt: 2}}>
						<Typography variant='h6' gutterBottom sx={{mt: 1}}>
							Threshold
						</Typography>
						<TextField
							variant='outlined'
							value={value}
							style={{ marginLeft: '10px' }}
							onChange={(event) => setValue(event.target.value)}
						/>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClick}>{type === 'edit' ? 'Save Changes' : 'Add Condition'}</Button>
				<Button onClick={handleClose} autoFocus>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default QualityGateDialog;
