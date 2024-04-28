import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@mui/material';

import { debounce } from '../utils';

const MultiRangeSlider = ({ handleVals, max, min, disabled, reversed, metricName, updateCategoryValues }) => {
	const [marks, setMarks] = useState([]);
	const [values, setValues] = useState(handleVals);

	let marksFull = [];
	for (let i = min; i <= max; i += max / 10) {
		marksFull.push({
			value: i,
			label: i.toString(),
		});
	}

	const calculateCategoryRanges = () => {
		const rangeA = Math.ceil(values[0] / 2);
		const rangeB = Math.ceil((values[1] - values[0]) / 2);
		const rangeC = Math.ceil((values[2] - values[1]) / 2);
		const rangeD = Math.ceil((values[3] - values[2]) / 2);
		const rangeE = Math.ceil((max - values[3]) / 2);

		const categ = [
			{ value: rangeA, label: reversed ? 'E' : 'A' },
			{ value: values[0] + rangeB, label: reversed ? 'D' : 'B' },
			{ value: values[1] + rangeC, label: 'C' },
			{ value: values[2] + rangeD, label: reversed ? 'B' : 'D' },
			{ value: values[3] + rangeE, label: reversed ? 'A' : 'E' },
		];

		setMarks(categ);
	};

	useEffect(() => {
		calculateCategoryRanges();
	}, []);

	const handleChange = (event, newValue) => {
		setValues(newValue);
		setMarks(marksFull);
	};

	const debouncedUpdateValues = useRef(
		debounce(async (values) => {
			await updateCategoryValues(metricName, values, max, reversed);
		}, 1500)
	).current;

	const handleChangeDone = async () => {
		calculateCategoryRanges();
		debouncedUpdateValues(values);
	};

	return (
		<Slider
			track={false}
			value={disabled ? null : values}
			marks={marks}
			disabled={disabled}
			max={max}
			min={min}
			valueLabelDisplay='auto'
			onChange={handleChange}
			onChangeCommitted={handleChangeDone}
		/>
	);
};

MultiRangeSlider.defaultProps = {
	min: 0,
	max: 100,
};

export default MultiRangeSlider;
