import * as React from 'react';
import { useState } from 'react';
import {
	Chip,
	MenuItem,
	Select,
	FormControl,
	Radio,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Grid,
	Checkbox,
	Button,
} from '@mui/material';

export default function FilterComponent({
	fileNames,
	filterValues,
	setFilterValues,
}) {
	const [selectedValues, setSelectedValues] = useState(
		filterValues.selectedValues
	);
	const [orangeChecked, setOrangeChecked] = useState(
		filterValues.orangeChecked
	);
	const [redChecked, setRedChecked] = useState(filterValues.redChecked);
	const [blueChecked, setBlueChecked] = useState(filterValues.blueChecked);
	const [impactLevel, setImpactLevel] = useState(filterValues.impactLevel);

	const handleDelete = (value) => {
		setSelectedValues(
			selectedValues.filter((selectedValue) => selectedValue !== value)
		);
	};

	const applyFilter = () => {
		setFilterValues({
			selectedValues,
			orangeChecked,
			redChecked,
			blueChecked,
			impactLevel,
		});
	};

	const resetFilterValues = () => {
		setSelectedValues(fileNames);
		setOrangeChecked(true);
		setRedChecked(true);
		setBlueChecked(true);
		setImpactLevel(3);
		setFilterValues({
			selectedValues: fileNames,
			orangeChecked: true,
			redChecked: true,
			blueChecked: true,
			impactLevel: 3,
		});
	};

	const renderValue = (selected) => {
		const numSelected = selected.length;

		const overflowCount = numSelected - 3;
		const displaySelected = selected.slice(0, 3);

		return (
			<div style={{ display: 'flex', flexWrap: 'wrap' }}>
				{displaySelected.map((value) => (
					<Chip
						key={value}
						label={value}
						onDelete={() => handleDelete(value)}
						style={{ margin: 2 }}
						onMouseDown={(event) => {
							event.stopPropagation();
						}}
					/>
				))}
				{overflowCount > 0 && (
					<Chip label={`+${overflowCount}`} style={{ margin: 2 }} />
				)}
			</div>
		);
	};

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<FormLabel component='legend'>Node Type</FormLabel>
				<FormControlLabel
					control={
						<Checkbox
							checked={orangeChecked}
							onChange={(event) =>
								setOrangeChecked(event.target.checked)
							}
							sx={{
								color: 'orange',
								'&.Mui-checked': {
									color: 'orange',
								},
							}}
						/>
					}
					label='Modified'
				/>
				<FormControlLabel
					control={
						<Checkbox
							checked={redChecked}
							onChange={(event) =>
								setRedChecked(event.target.checked)
							}
							sx={{
								color: '#ff6961',
								'&.Mui-checked': { color: '#ff6961' },
							}}
						/>
					}
					label='Removed'
				/>
				<FormControlLabel
					control={
						<>
							<Checkbox
								checked={blueChecked}
								onChange={(event) =>
									setBlueChecked(event.target.checked)
								}
								sx={{
									color: 'lightblue',
									'&.Mui-checked': { color: 'lightblue' },
								}}
							/>
						</>
					}
					label='Possibly Affected'
				/>
			</Grid>
			<Grid item xs={12}>
				<FormLabel id='impact-level-label'>
					Maximum Impact Level
				</FormLabel>
				<RadioGroup
					row
					aria-labelledby='impact-level-label'
					value={impactLevel}
					onChange={(event) => setImpactLevel(event.target.value)}
				>
					<FormControlLabel value='1' control={<Radio />} label='1' />
					<FormControlLabel value='2' control={<Radio />} label='2' />
					<FormControlLabel value='3' control={<Radio />} label='3' />
				</RadioGroup>
			</Grid>
			<Grid item xs={12}>
				<FormLabel component='legend'>Files to Include</FormLabel>
				<FormControl fullWidth>
					<Select
						labelId='node-type-label'
						multiple
						value={selectedValues}
						onChange={(event) =>
							setSelectedValues(event.target.value)
						}
						renderValue={renderValue}
						size='small'
					>
						{fileNames.map((option) => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>

			<Grid
				item
				xs={12}
				container
				direction='row'
				justifyContent='space-between'
			>
				<Button
					color='success'
					sx={{ mt: 1, textTransform: 'none', fontSize: 16 }}
					onClick={applyFilter}
				>
					Apply Filter
				</Button>
				<Button
					color='error'
					sx={{ mt: 1, textTransform: 'none', fontSize: 16 }}
					onClick={resetFilterValues}
				>
					Reset All
				</Button>
			</Grid>
		</Grid>
	);
}
