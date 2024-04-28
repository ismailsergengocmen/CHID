import React, {useEffect, useState} from 'react'
import { useParams, Link } from 'react-router-dom';
import CardList from '../components/CardList'
import { Box, Typography, Alert, AlertTitle, Divider } from '@mui/material'
import ChartGroup from '../components/ChartGroup';
import MultiColorBar from '../components/MultiColorBar';
import backendClient from '../config/axiosConfig.js';
import Loading from '../components/Loading';

export default function Overview(){
  const {repoID} = useParams();
  const [readings, setReadings] = useState([]);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
	const [riskScoreInformation, setRiskScoreInformation] = useState({});
	const [codeChurnInformation, setCodeChurnInformation] = useState({});
	const [bugFrequencyInformation, setBugFrequencyInformation] = useState({});
	const [prSizeInformation, setPrSizeInformation] = useState({});
  const [labelsInformation, setLabelsInformation] = useState(["Jun"]);

  useEffect(() => {
    const getLanguages = async () => {
      const temp = await backendClient.get(`/api/repositories/${repoID}/overview/languages`);
      const data1 = temp.data;
      let languages = data1.map((item) => {
        const color = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
        return {
          "language_name": item.language_name,
          "percentage": item.percentage,
          "color": `#${color}`
        }
      })

      //If language percentage is lower than 3%, combine it into "Others"
      let others = 0;
      for(let i = 0; i < languages.length; i++){
        if(languages[i].percentage < 3){
          others += languages[i].percentage;
          languages.splice(i, 1);
          i--;
        }
      }

      const color = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
      if(others > 0){
        languages.push({
          "language_name": "Others",
          "percentage": others.toFixed(2),
          "color": `#${color}`
        })
      }

      let {data} = await backendClient.get(`/api/repositories/${repoID}/pullRequests`);

      // for(let i = 0; i < data.length; i++){
      //   console.log("PR no: ", data[i].number) 
      //   console.log("Risk score: ", data[i].analysis.risk_score.score);
      //   if(data[i].analysis){
          
      //   }
      // }

      const prArray = data.map((pr) => {
        const timestamp = pr.createdAt;
        const date = new Date(timestamp);
        const dateString = date.toLocaleDateString(); // Returns the date portion of the timestamp in the user's local time zone
        const timeString = date.toLocaleTimeString(); // Returns the time portion of the timestamp in the user's local time zone
        const formattedDate = `${dateString} ${timeString}`; // Combines the date and time strings

        const name = pr.title;
        const highlyBuggyRate = ((pr.analysis.highly_buggy_file_result.count / pr.files.length) * 100).toFixed(2);
        const highlyChurnRate = ((pr.analysis.highly_churn_file_result.count / pr.files.length) * 100).toFixed(2);

        return {
          number: pr.number,
          name: name,
          creationTime: formattedDate,
          description: pr.description,
          riskScoreDetails: `${pr.analysis.risk_score.score}%`,
          highlyBuggyRate: `${highlyBuggyRate}%`,
          highlyChurnRate: `${highlyChurnRate}%`,
          qualityGateStatus: pr.analysis.quality_gate.status, 
        };
      });

      const currentDate = new Date();

      //////////////
      // FOR DAYS //
      //////////////

      const daysToAverage = 5; // adjust this as needed
      const metricAveragesPerDay = {
        riskScore: [],
        codeChurn: [],
        bugFrequency: [],
        prSize: []
      };

      const abbreviationDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = [];

      // iterate over each day, starting with the current day and going back "daysToAverage" days
      for (let i = 0; i < daysToAverage; i++) {
        const currentDateCopy = new Date(currentDate);
        currentDateCopy.setDate(currentDateCopy.getDate() - i);
        const currentMonth = currentDateCopy.getMonth();
        const currentDay = currentDateCopy.getDate();
        const currentYear = currentDateCopy.getFullYear();

        const pullRequestsInDay = data.filter((pr) => {
          const prDate = new Date(pr.createdAt);
          return prDate.getMonth() === currentMonth && prDate.getDate() === currentDay && prDate.getFullYear() === currentYear;
        });

        days.push(`${abbreviationDays[currentDateCopy.getDay()]} ${currentDay}`)
        calculateGraphInfos(pullRequestsInDay, metricAveragesPerDay);
      }
      const labelsDay = reverseInfo(days, daysToAverage);

      ///////////////
      // FOR WEEKS //
      ///////////////

      const weeksToAverage = 5; // adjust this as needed

      const metricAveragesPerWeek = {
        riskScore: [],
        codeChurn: [],
        bugFrequency: [],
        prSize: []
      };

      let weeks = [];

      // iterate over each week, starting with the current week and going back "weeksToAverage" weeks
      for (let i = 0; i < weeksToAverage; i++) {
        const startOfWeek = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const endOfWeek = new Date(startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000));
        const pullRequestsInWeek = data.filter((pr) => {
          const prDate = new Date(pr.createdAt);
          return prDate >= startOfWeek && prDate < endOfWeek;
        });
        
        // console.log("weeksToAverage", weeks[i] ," Pull requests in week: ", pullRequestsInWeek)
        const formattedDate = startOfWeek.toLocaleDateString(undefined, {day: 'numeric', month: 'short'});
        weeks.push(formattedDate);
        
        calculateGraphInfos(pullRequestsInWeek, metricAveragesPerWeek);
      }

      const labelsWeek = reverseInfo(weeks, weeksToAverage);

      ////////////////
      // FOR MONTHS //
      ////////////////

      const monthsToAverage = 5; // adjust this as needed
      const metricAveragesPerMonth = {
        riskScore: [],
        codeChurn: [],
        bugFrequency: [],
        prSize: []
      };

      const abbreviationsMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const months = []

      // iterate over each month, starting with the current month and going back "monthsToAverage" months
      for (let i = 0; i < monthsToAverage; i++) {
        let tempMonth = (currentDate.getMonth() - i) % 11;
        if (temp < 0) {
          tempMonth += 11;
        }
        const currentMonth = tempMonth;
        const currentYear = currentDate.getFullYear();
        const pullRequestsInMonth = data.filter((pr) => {
          const prDate = new Date(pr.createdAt);
          return prDate.getMonth() === currentMonth && prDate.getFullYear() === currentYear;
        });

        months.push(abbreviationsMonth[currentMonth])
        calculateGraphInfos(pullRequestsInMonth, metricAveragesPerMonth);
      }

      const labelsMonth = reverseInfo(months, metricAveragesPerMonth);

      ///////////////
      // FOR YEARS //
      ///////////////

      const yearsToAverage = 5; // adjust this as needed
      const metricAveragesPerYear = {
        riskScore: [],
        codeChurn: [],
        bugFrequency: [],
        prSize: []
      };

      const years = []

      // iterate over each year, starting with the current year and going back "yearsToAverage" years
      for (let i = 0; i < yearsToAverage; i++) {
        const currentYear = currentDate.getFullYear() - i;
        const pullRequestsInYear = data.filter((pr) => {
          const prDate = new Date(pr.createdAt);
          return prDate.getFullYear() === currentYear;
        });

        years.push(currentYear)
        calculateGraphInfos(pullRequestsInYear, metricAveragesPerYear);
      }

      const labelsYear = reverseInfo(years, metricAveragesPerYear)

      const riskScoreInformation = {
        years: metricAveragesPerYear.riskScore,
        months: metricAveragesPerMonth.riskScore,
        weeks: metricAveragesPerWeek.riskScore.reverse(),
        days: metricAveragesPerDay.riskScore.reverse(),
      }
      
      const codeChurnInformation = {
        years: metricAveragesPerYear.codeChurn,
        months: metricAveragesPerMonth.codeChurn,
        weeks: metricAveragesPerWeek.codeChurn.reverse(),
        days: metricAveragesPerDay.codeChurn.reverse(),
      }

      const bugFrequencyInformation = {
        years: metricAveragesPerYear.bugFrequency,
        months: metricAveragesPerMonth.bugFrequency,
        weeks: metricAveragesPerWeek.bugFrequency.reverse(),
        days: metricAveragesPerDay.bugFrequency.reverse(),
      }

      const prSizeInformation = {
        years: metricAveragesPerYear.prSize,
        months: metricAveragesPerMonth.prSize,
        weeks: metricAveragesPerWeek.prSize.reverse(),
        days: metricAveragesPerDay.prSize.reverse(),
      };

      const labelsInformation = {
        years: labelsYear,
        months: labelsMonth,
        weeks: labelsWeek,
        days: labelsDay,
      }

      setRiskScoreInformation(riskScoreInformation);
      setCodeChurnInformation(codeChurnInformation);
      setBugFrequencyInformation(bugFrequencyInformation);
      setPrSizeInformation(prSizeInformation);
      setLabelsInformation(labelsInformation)
      setRows(prArray);
      setReadings(languages);
      setIsLoading(false);

      // console.log("riskScoreInformation", riskScoreInformation)
      // console.log("codeChurnInformation", codeChurnInformation)
      // console.log("bugFrequencyInformation", bugFrequencyInformation)
      // console.log("prSizeInformation", prSizeInformation)
      // console.log("labelsInformation", labelsInformation)
    };

    const calculateGraphInfos = (timeUnits, metricAverages) => {
      // Risk Score Graph
      const totalRiskScore = timeUnits.reduce((acc, pr) => {
        return acc + pr.analysis.risk_score.score;
      }, 0);
      const averageRiskScore = totalRiskScore / timeUnits.length;
      metricAverages.riskScore.push(isNaN(averageRiskScore) ? 0 : averageRiskScore);

      // Bug Frequency Graph
      const totalHighlyBuggyFileRate = timeUnits.reduce((acc, pr) => {
        return acc + (pr.analysis.highly_buggy_file_result.count / pr.files.length) * 100;
      }, 0);
      const averageHighlyBuggyFileRate = totalHighlyBuggyFileRate / timeUnits.length;
      metricAverages.bugFrequency.push(isNaN(averageHighlyBuggyFileRate) ? 0 : averageHighlyBuggyFileRate);

      // Code Churn Graph
      const totalHighlyChurnedFileRate = timeUnits.reduce((acc, pr) => {
        return acc + (pr.analysis.highly_churn_file_result.count / pr.files.length) * 100;
      }, 0);
      const averageHighlyChurnedFileRate = totalHighlyChurnedFileRate / timeUnits.length;
      metricAverages.codeChurn.push(isNaN(averageHighlyChurnedFileRate) ? 0 : averageHighlyChurnedFileRate);

      // PR Size Graph
      const totalPrSize = timeUnits.reduce((acc, pr) => {
        const additions = pr.lines.additions;
        const deletions = pr.lines.deletions;
        return acc + additions + deletions;
      }, 0);
      const averagePrSize = totalPrSize / timeUnits.length;
      metricAverages.prSize.push(isNaN(averagePrSize) ? 0 : averagePrSize);
    }

    const reverseInfo = (labelSetReverse, data) => {
      let labelSet = labelSetReverse.reverse();
      
      if(data.riskScore){
        data.riskScore = data.riskScore.reverse();
      }
      if(data.codeChurn){
        data.codeChurn = data.codeChurn.reverse();
      }
      if(data.bugFrequency){
        data.bugFrequency = data.bugFrequency.reverse();
      }
      if(data.prSize){
        data.prSize = data.prSize.reverse();
      }
      return labelSet;
    }

    getLanguages();
    
    }, [repoID]);
  
  
  return (
    <>
    {isLoading ? <Loading/> : 
      <Box display="flex" flexDirection="column" sx={{width: `calc(100% - 13%)`, ml: `13%`}}>
        <MultiColorBar readings={readings}/>
        <Box sx={{ ml:"7%" }} display="flex" flexDirection="column" justifyContent="center">
          <Box display="flex">
            <Typography sx={{mr:"15%", ml:"1%"}}> Metric Evolution </Typography>
            <Link to='activity' sx={{cursor: 'pointer'}}>
              <Typography style={{textDecoration: 'underline', fontWeight: 600, color: '#5d6cd0'}}>
                See detailed history
              </Typography>
            </Link>
          </Box>
          <Box display="flex">
            <Box>
              <ChartGroup riskScoreInformation={riskScoreInformation} 
              codeChurnInformation={codeChurnInformation} bugFrequencyInformation={bugFrequencyInformation} 
              prSizeInformation={prSizeInformation} labelsInformation={labelsInformation}/>
            </Box>
            <Box ml={"7%"} mt={1} maxWidth={3/10}>
              <Alert severity="info">
                <AlertTitle><strong>Overview Page</strong></AlertTitle>
                This page includes general overview of the repository
                <ul style={{listStylePosition: "inside", paddingInlineStart: 0}}>
                  <li style={{margin: "3% 0"}}>The language bar shows the percentage of each language in the repository </li>
                  <li style={{margin: "3% 0"}}>The metric evolution chart shows the average of each metric in the last 5 years/months/weeks/days </li>
                  <li style={{margin: "3% 0"}}>The latest activity list shows the latest 20 pull requests with related analysis information</li>
                </ul>
              </Alert>
            </Box>
          </Box>
        </Box>
        <Box sx={{mt:3}}>
          <Typography sx={{width: 8 / 10, mx: 5, mt: 2}}> Latest Activity </Typography>
          <CardList data={rows}/>
        </Box>
      </Box>
    }
    </>
  )
}
