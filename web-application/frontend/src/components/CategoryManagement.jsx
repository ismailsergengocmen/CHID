import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import {
	TextField,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	Box,
	Divider,
	Typography,
} from '@mui/material';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';

import MultiRangeSlider from './MultiRangeSlider';
import backendClient from '../config/axiosConfig';
import { debounce } from '../utils';

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

const CategoryManagement = () => {
	const [metrics, setMetrics] = useState([]);
	const { repoID } = useParams();

	useEffect(() => {
		const initMetrics = async () => {
			const { data } = await backendClient.get(`/api/settings/${repoID}?part=metric_management`);
			setMetrics(data);
		};

		initMetrics();
	}, [repoID]);

	const convertMetricName = (metric) => {
		const parts = metric.split('_');
		const convertedString = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
		return convertedString;
	};

	const thresholdLabel = (metric) => {
		if (metric === 'highly_churn_file') {
			return 'File High Churn Threshold';
		} else if (metric === 'highly_buggy_file') {
			return 'File Bugginess Threshold';
		} else if (metric === 'highly_co_change_file') {
			return 'High Co-Change Threshold';
		}
	};

	const riskScoreCoefficientLabel = (metric) => {
		if (metric === 'highly_churn_file_coefficient') {
			return 'Highly Churn File Ratio';
		} else if (metric === 'highly_buggy_file_coefficient') {
			return 'Highly Buggy File Ratio';
		} else if (metric === 'pr_size_coefficient') {
			return 'PR Size';
		} else if (metric === 'author_merge_rate_coefficient') {
			return 'Author Merge Rate';
		} else if (metric === 'page_rank_score_coefficient') {
			return 'Impact Size';
		}
	};

	const calculateDisabled = (metric) => {
		if (metric === 'highly_co_change_file') {
			return true;
		}
		return false;
	};

	const updateCategoryValues = async (metricName, handleVals, max, reversed) => {
		let newCategVals = {
			a: { lower_bound: 0, upper_bound: handleVals[0] },
			b: { lower_bound: Math.min(handleVals[0] + 1, max), upper_bound: handleVals[1] },
			c: { lower_bound: Math.min(handleVals[1] + 1, max), upper_bound: handleVals[2] },
			d: { lower_bound: Math.min(handleVals[2] + 1, max), upper_bound: handleVals[3] },
			e: { lower_bound: Math.min(handleVals[3] + 1, max), upper_bound: max },
		};

		if (reversed) {
			newCategVals = {
				a: newCategVals.e,
				b: newCategVals.d,
				c: newCategVals.c,
				d: newCategVals.b,
				e: newCategVals.a,
			};
		}

		try {
			await backendClient.put(
				`/api/settings/metric_management/category/${repoID}?metric=${metricName}`,
				newCategVals
			);
			enqueueSnackbar('Changes are successfully saved.', {
				variant: 'success',
			});
		} catch (err) {
			enqueueSnackbar('There was an error. Please try again.', {
				variant: 'error',
			});
		}
	};

	const debouncedFileThreshold = useRef(
		debounce(async (newValue, metricKey) => {
			try {
				await backendClient.put(`/api/settings/metric_management/threshold/${repoID}?metric=${metricKey}`, {
					newValue,
				});
				enqueueSnackbar('Changes are successfully saved.', {
					variant: 'success',
				});
			} catch (err) {
				enqueueSnackbar('There was an error. Please try again.', {
					variant: 'error',
				});
			}
		}, 1500)
	).current;

	const debouncedMetricThreshold = useRef(
		debounce(async (newValue, metricKey) => {
			try {
				await backendClient.put(`/api/settings/metric_management/coefficient/${repoID}?metric=${metricKey}`, {
					newValue,
				});
				enqueueSnackbar('Changes are successfully saved.', {
					variant: 'success',
				});
			} catch (err) {
				enqueueSnackbar('There was an error. Please try again.', {
					variant: 'error',
				});
			}
		}, 1500)
	).current;

	const handleThresholdChange = async (event, metricKey) => {
		let newValue = event.target.value;
		if (event.target.value === '') {
			newValue = 0;
		}

		const newMetrics = { ...metrics };
		newMetrics[metricKey] = { ...newMetrics[metricKey], file_threshold: newValue };
		setMetrics(newMetrics);
		debouncedFileThreshold(newValue, metricKey);
	};

	const handleCoefficientChange = async (event, metricKey) => {
		let newValue = event.target.value;
		if (event.target.value === '') {
			newValue = 0;
		}
		
		const newRiskScoreFormula = { ...metrics.risk_score.formula }
		newRiskScoreFormula[metricKey] = Number(newValue)
		const newMetrics = { ...metrics };
		newMetrics.risk_score.formula = newRiskScoreFormula;
		
		console.log(newMetrics)
		setMetrics(newMetrics);
		debouncedMetricThreshold(newValue, metricKey);
	};

	return (
		<Box border={1} borderColor='text.primary' sx={{ width: 5.5 / 10, ml: 10, mt: 10 }}>
			<Box display='flex' flexDirection='column' sx={{ alignItems: 'center' }}>
				<Typography variant='h6' gutterBottom sx={{ mx: 2 }}>
					Metric Management
				</Typography>
				<Typography variant='subtitle1' gutterBottom sx={{ mx: 2 }}>
					Select threshold for categories and default values for metrics that will be used in analysis
				</Typography>
			</Box>
			<Divider />
			<Paper
				sx={{
					height: 415,
					overflowY: 'scroll',
					direction: 'rtr',
				}}
			>
				<TableContainer component={Paper}>
					<Table stickyHeader>
						<TableBody>
							{Object.keys(metrics)
								.filter((key) => key !== '_id')
								.map((metricKey) => {
									const metric = metrics[metricKey];
									let reversed;
									let max;
									let handleVals = [
										metric.a?.upper_bound,
										metric.b?.upper_bound,
										metric.c?.upper_bound,
										metric.d?.upper_bound,
									];

									// Check whether values are reversed
									if (metric.a?.upper_bound > metric.e?.upper_bound) {
										reversed = true;
										max = metric.a?.upper_bound;
										handleVals = [
											metric.e?.upper_bound,
											metric.d?.upper_bound,
											metric.c?.upper_bound,
											metric.b?.upper_bound,
										];
									} else {
										reversed = false;
										max = metric.e?.upper_bound ? metric.e?.upper_bound : 1000;
									}

									return (
										<StyledTableRow>
											<StyledTableCell component='th' scope='row' width='12%'>
												<Typography sx={{ fontWeight: 'bold' }}>
													{convertMetricName(metricKey)}
												</Typography>
											</StyledTableCell>
											<StyledTableCell component='th' scope='row' width='70%'>
												<MultiRangeSlider
													handleVals={handleVals}
													reversed={reversed}
													disabled={calculateDisabled(metricKey)}
													min={0}
													max={max}
													metricName={metricKey}
													updateCategoryValues={updateCategoryValues}
												/>
											</StyledTableCell>
											<StyledTableCell component='th' scope='row'>
												<Box
													sx={{
														display: 'inline-flex',
													}}
												>
													<TextField
														disabled={metric.file_threshold === undefined}
														value={metrics[metricKey].file_threshold}
														onChange={(event) => handleThresholdChange(event, metricKey)}
														label={thresholdLabel(metricKey)}
														type='number'
														InputLabelProps={{
															shrink: true,
														}}
													/>
												</Box>
											</StyledTableCell>
										</StyledTableRow>
									);
								})}
						</TableBody>
					</Table>
					<Table>
						<TableRow>
							<TableCell component='th' scope='row' width='100%'>
								<Typography sx={{ fontWeight: 'bold' }}>Risk Score Formula Coefficients</Typography>
							</TableCell>
						</TableRow>
					</Table>
					<Table>
						<TableBody>
							{metrics.risk_score &&
								metrics.risk_score.formula &&
								Object.keys(metrics.risk_score.formula).map((e) => {
									return (
										<StyledTableRow>
											<StyledTableCell component='th' scope='row' width='60%'>
												<Typography sx={{ fontWeight: 'bold' }}>
													{riskScoreCoefficientLabel(e)}
												</Typography>
											</StyledTableCell>
											<StyledTableCell component='th' scope='row'>
												<TextField
													disabled={metrics.risk_score.formula[e] === undefined}
													value={metrics.risk_score.formula[e]}
													onChange={(event) => handleCoefficientChange(event, e)}
													// label={thresholdLabel(metricKey)}
													type='number'
													InputLabelProps={{
														shrink: true,
													}}
												/>
											</StyledTableCell>
										</StyledTableRow>
									);
								})}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
			<SnackbarProvider
				maxSnack={3}
				anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
				autoHideDuration={4000}
			/>
		</Box>
	);
};

export default CategoryManagement;
