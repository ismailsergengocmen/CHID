import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
	Table,
	TableBody,
	TableCell,
	tableCellClasses,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Box,
	IconButton,
	Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';

import AddConditionCheck from './AddConditionCheck';
import EditConditionCheck from './EditConditionCheck';

import backendClient from '../config/axiosConfig';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: theme.palette.common.hover,
		color: theme.palette.common.black,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));

export default function QualityGateSettings() {
	const { repoID } = useParams();
	const [qualityGate, setQualityGate] = useState([]);

	const initQualityGate = useCallback(async () => {
		const { data } = await backendClient.get(`/api/settings/${repoID}?part=quality_gate`);
		setQualityGate(data);
	}, [repoID]);

	useEffect(() => {
		initQualityGate();
	}, [repoID, initQualityGate]);

	const handleDelete = async ({ metric_name, threshold }) => {
		const deletedQuality = {
			metric_name,
			threshold,
		};

		backendClient
			.delete(`/api/settings/quality_gate/${repoID}`, {
				data: deletedQuality,
			})
			.then(async () => {
				enqueueSnackbar('Condition is successfully deleted.', {
					variant: 'success',
				});
				await initQualityGate();
			})
			.catch((err) => {
				enqueueSnackbar('There was an error. Please try again.', {
					variant: 'error',
				});
			});
	};

	const convertMetricName = (metricVal) => {
		if (metricVal === 'risk_score') {
			return 'Risk Score';
		} else if (metricVal === 'highly_churn_file') {
			return 'High Churn File Rate';
		} else if (metricVal === 'highly_buggy_file') {
			return 'Highly Buggy File Rate';
		} else if (metricVal === 'pr_size') {
			return 'Pull Request Size';
		}
	};

	const convertMetricUnit = (metricVal) => {
		if (metricVal === 'risk_score') {
			return '%';
		} else if (metricVal === 'highly_churn_file') {
			return '%';
		} else if (metricVal === 'highly_buggy_file') {
			return '%';
		} else if (metricVal === 'pr_size') {
			return 'lines';
		}
	};

	return (
		<Box border={1} borderColor='text.primary' sx={{ width: 5.5 / 10, ml: 10, mt: 10 }}>
			<Box display="flex" flexDirection="column" sx={{ alignItems: 'center' }}>
				<Typography variant='h6' sx={{ml:1.5}}>Quality Gate</Typography>
				<Typography variant='subtitle1' sx={{ml:1.5}}>Select conditions that your analysis should meet</Typography>
			</Box>
			<Paper sx={{ height: 378, overflowY: 'scroll'}}>
				<TableContainer component={Paper}>
					<Table stickyHeader aria-label='sticky table'>
						<TableHead>
							<TableRow>
								<TableCell align="left">Metric</TableCell>
								<TableCell align='right'>Threshold</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{qualityGate.map((row) => (
								<StyledTableRow key={row.metric_name}>
									<StyledTableCell component='th' scope='row'>
										{convertMetricName(row.metric_name)}
									</StyledTableCell>
									<StyledTableCell align='right'>{row.threshold} {convertMetricUnit(row.metric_name)}</StyledTableCell>
									<EditConditionCheck
										initQualityGate={initQualityGate}
										currMetric={row.metric_name}
										currValue={row.threshold}
										enqueueSnackbar={enqueueSnackbar}
									/>
									<IconButton onClick={() => handleDelete(row)} aria-label='edit'>
										<DeleteIcon />
									</IconButton>
								</StyledTableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<AddConditionCheck initQualityGate={initQualityGate} enqueueSnackbar={enqueueSnackbar}/>
			</Paper>
			<SnackbarProvider
				maxSnack={3}
				anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
				autoHideDuration={4000}
			/>
		</Box>
	);
}
