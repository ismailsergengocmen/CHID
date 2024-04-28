import {useEffect, useState} from 'react';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';
import BasicChart from '../components/BasicChart';

const riskScoreOptions = {
	datasets: [{ 
		label: 'Risk Score Average(%)',
		backgroundColor: '#eb4d4b',
		borderColor: 'grey',
		pointBackgroundColor: '#eb4d4b',
		tension: 0.4,
	}]
}

const codeChurnOptions = {
	datasets: [{ 
		label: 'Highly Churned File Average(%)',
		backgroundColor: 'yellow',
		borderColor: 'grey',
		pointBackgroundColor: 'yellow',
		tension: 0.4,
	}]
}

const bugFrequencyOptions = {
	datasets: [{
		label: 'Highly Buggy File Average(%)',
		backgroundColor: '#6ab04c',
		borderColor: 'grey',
		pointBackgroundColor: '#6ab04c',
		tension: 0.4,
	}]
}

const prSizeOptions = {
	datasets: [{
		label: 'Lines of Code Average',
		backgroundColor: '#22a6b3',
		borderColor: 'grey',
		pointBackgroundColor: '#22a6b3',
		tension: 0.4,
	}]
}


export default function ChartGroup(props) {
	const [selectedBtn, setSelectedBtn] = useState(2);
	const [filter, setFilter] = useState("months"); // "years", "months", "weeks", "days"
	const [riskScoreChartInfo, setRiskScoreChartInfo] = useState({ labels: ["Jun"], ...riskScoreOptions });
	const [bugFreqChartInfo, setBugFreqChartInfo] = useState({ labels: ["Jun"], ...bugFrequencyOptions });
	const [codeChurnChartInfo, setCodeChurnChartInfo] = useState({ labels: ["Jun"], ...codeChurnOptions });
	const [prSizeChartInfo, setPrSizeChartInfo] = useState({ labels: ["Jun"], ...prSizeOptions });

  const {
    riskScoreInformation,
    codeChurnInformation,
    bugFrequencyInformation,
    prSizeInformation,
		labelsInformation
  } = props;


	useEffect(() => {
		const riskScoreInfo = { ...riskScoreOptions };
		const bugFreqInfo = { ...bugFrequencyOptions };
		const codeChurnInfo = { ...codeChurnOptions };
		const prSizeInfo = { ...prSizeOptions };

		const determineLabels = (labels) => {
			riskScoreInfo.labels = labels;
			bugFreqInfo.labels = labels;
			codeChurnInfo.labels = labels;
			prSizeInfo.labels = labels;
		}

		const setUseStates = () => {
			setRiskScoreChartInfo(riskScoreInfo);
			setBugFreqChartInfo(bugFreqInfo);
			setCodeChurnChartInfo(codeChurnInfo);
			setPrSizeChartInfo(prSizeInfo);
		}

		const setData = (riskData, bugFreqData, codeChurnData, prSizeData) => {
			riskScoreInfo.datasets[0].data = riskData;
			bugFreqInfo.datasets[0].data = bugFreqData;
			codeChurnInfo.datasets[0].data = codeChurnData;
			prSizeInfo.datasets[0].data = prSizeData;
		}

		if(filter === "years") {
			determineLabels(labelsInformation.years);
			setData(riskScoreInformation.years, bugFrequencyInformation.years, codeChurnInformation.years, prSizeInformation.years);
		}
		else if(filter === "months") {
			determineLabels(labelsInformation.months);
			setData(riskScoreInformation.months, bugFrequencyInformation.months, codeChurnInformation.months, prSizeInformation.months);
		}
		else if(filter === "weeks") {
			determineLabels(labelsInformation.weeks);
			setData(riskScoreInformation.weeks, bugFrequencyInformation.weeks, codeChurnInformation.weeks, prSizeInformation.weeks);
		}
		else if(filter === "days") {
			determineLabels(labelsInformation.days);
			setData(riskScoreInformation.days, bugFrequencyInformation.days, codeChurnInformation.days, prSizeInformation.days);
		}

		setUseStates();

	}, [filter]);

	return (
		<Box display='flex' flexDirection='column'>
			<Box display='flex' flexDirection='row'>
				<BasicChart chartInfo={riskScoreChartInfo} filter={filter} style={{ flex: 1 }}/>
				<BasicChart chartInfo={bugFreqChartInfo} filter={filter} style={{ flex: 1 }}/>
			</Box>
			<Box display='flex' flexDirection='row'>
				<BasicChart chartInfo={codeChurnChartInfo} filter={filter} style={{ flex: 1 }}/>
				<BasicChart chartInfo={prSizeChartInfo} filter={filter} style={{ flex: 1 }}/>
			</Box>
			<Box display='flex' flexDirection='row'>
				<Typography sx={{mt:0.5, mr: 1, ml: 1}}>Last 5 </Typography>
				<ButtonGroup size="small" disableElevation color="primary">
					<Button variant={selectedBtn === 1 ? "contained" : "outlined"} onClick={()=> {setSelectedBtn(1); setFilter("years");}}>Years</Button>
					<Button variant={selectedBtn === 2 ? "contained" : "outlined"} onClick={()=> {setSelectedBtn(2); setFilter("months");}}>Months</Button>
					<Button variant={selectedBtn === 3 ? "contained" : "outlined"} onClick={()=> {setSelectedBtn(3); setFilter("weeks");}}>Weeks</Button>
					<Button variant={selectedBtn === 4 ? "contained" : "outlined"} onClick={()=> {setSelectedBtn(4); setFilter("days");}}>Days</Button>
				</ButtonGroup>
			</Box>
		</Box>
	);
}
