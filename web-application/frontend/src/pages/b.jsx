import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@mui/material';
import { debounce } from '../utils';

const followersMarks = [
  {
    value: 0,
    scaledValue: 1,
    label: "1"
  },
  {
    value: 25,
    scaledValue: 10,
    label: "10"
  },
  {
    value: 50,
    scaledValue: 50,
    label: "50"
  },
  {
    value: 75,
    scaledValue: 100,
    label: "100"
  },
  {
    value: 100,
    scaledValue: 200,
    label: "200"
  },
  {
    value: 125,
    scaledValue: 500,
    label: "500"
  },
  {
    value: 150,
    scaledValue: 1000,
    label: "1k"
  },
  {
    value: 175,
    scaledValue: 2000,
    label: "2k"
  },
  {
    value: 200,
    scaledValue: 5000,
    label: "5k"
  },
	{
    value: 225,
    scaledValue: 10000,
    label: "10k"
  },
	{
    value: 250,
    scaledValue: 30000,
    label: "30k"
  }
];

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

	const scale = value => {
		const previousMarkIndex = Math.floor(value / 25);
		const previousMark = followersMarks[previousMarkIndex];
		const remainder = value % 25;
		if (remainder === 0) {
			return previousMark.scaledValue;
		}
		const nextMark = followersMarks[previousMarkIndex + 1];
		const increment = (nextMark.scaledValue - previousMark.scaledValue) / 25;
		return remainder * increment + previousMark.scaledValue;
	};

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
		<>
		{ metricName != "pr_size" ? 
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
			:
			<Slider
				track={false}
				value={disabled ? null : values}
				disabled={disabled}
				marks={followersMarks}
        min={0}
        step={1}
        max={250}
        scale={scale}
				valueLabelDisplay='auto'
				onChange={handleChange}
				onChangeCommitted={handleChangeDone}
			/>
		}
		</>
	);
};

MultiRangeSlider.defaultProps = {
	min: 0,
	max: 100,
};

export default MultiRangeSlider;
