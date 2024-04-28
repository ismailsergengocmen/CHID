import { useState, useEffect } from 'react'
import {Box, Alert, AlertTitle, Divider} from '@mui/material'
import FilterGroup from '../components/FilterGroup'
import LineChart from "../components/LineChart"
import backendClient from '../config/axiosConfig'
import { useParams } from 'react-router-dom';
import Loading from '../components/Loading'

const initialFilters = {
  measure:"riskScore",
  startDate: "",
  endDate: "",
  category: "",
  role: "",
  name: "",
}

export default function Activity(){
  const {repoID} = useParams();
  const [unfilteredData, setUnFilteredData] = useState([]);
  const [filterSet, setFilterSet] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=> {
    const getUnFilteredData = async () => {
      const {data} = await backendClient.get(`/api/repositories/${repoID}/pullRequests`);
      let pullRequest = data.reverse();

      let riskScoreTotal = 0;
      let highChurnFileCount = 0;
      let highChurnTotal = 0;
      let bugFreqTotal = 0;
      let bugFreqFileCount = 0;
      let sizeTotal = 0;
      let prCount = 0;
      let initialPRInfos = [] 

      pullRequest.forEach((pr) => {
        let tempChurn = 0;
        let tempChurnFileCount = 0;
        let tempBugFreq = 0;
        let tempBugFreqFileCount = 0;
        
        prCount += 1;

        pr.analysis.current_code_churns.forEach((file) => {
          highChurnFileCount += 1;
          tempChurnFileCount += 1;
          highChurnTotal += file.current_code_churn;
          tempChurn += file.current_code_churn;
        })

        pr.analysis.current_bug_frequencies.forEach((file) => {
          bugFreqFileCount += 1;
          tempBugFreqFileCount += 1;
          bugFreqTotal += file.current_bug_frequency;
          tempBugFreq += file.current_bug_frequency;
        })

        riskScoreTotal += pr.analysis.risk_score.score;
        sizeTotal += pr.lines.additions + pr.lines.deletions

        const assignees = pr.assignees.map((assignee) => assignee.name || assignee.login);
        const reviewers = pr.reviewers.map((reviewer) => reviewer.name || reviewer.login);

        const initialPRInfo = {
          number: pr.number,
          day: pr.createdAt,
          infos: {
            riskScore: pr.analysis.risk_score.score,
            riskScoreAvg: riskScoreTotal / prCount,
            prSize: pr.lines.additions + pr.lines.deletions,
            prSizeAvg: sizeTotal / prCount,
            codeChurn: tempChurn / tempChurnFileCount,
            codeChurnAvg: highChurnTotal / highChurnFileCount,
            bugFreq: tempBugFreq / tempBugFreqFileCount,
            bugFreqAvg: bugFreqTotal / bugFreqFileCount,
          },
          qualityGate: pr.analysis.quality_gate.status ? 1 : 0,
          assignees: assignees,
          reviewers: reviewers,
          author: pr.author.name || pr.author.login,
          riskScoreCat: convertCategory(pr.analysis.risk_score.category),
          codeChurnCat: convertCategory(pr.analysis.highly_churn_file_result.category),
          bugFreqCat: convertCategory(pr.analysis.highly_buggy_file_result.category),
          prSizeCat: convertCategory(pr.analysis.pr_size_result.category),
        }
        initialPRInfos.push(initialPRInfo)
      })
      setUnFilteredData(initialPRInfos)
      setIsLoading(false);
    }

    const convertCategory = (category) => {
      if (category == 0) {
        return "A";
      } else if (category == 1) {
        return "B";
      } else if (category == 2) {
        return "C";
      } else if (category == 3) {
        return "D";
      } else {
        return "E";
      }
    }

    getUnFilteredData();
    
  }, [repoID])

  const handleFilterChange = (filterData) => {
    // Here you can perform any data filtering or manipulation based on the filter data passed from the child component
    // For example, you could call an API endpoint to fetch data based on the filter criteria and set the resulting data in state
    setFilterSet(filterData)
  };

  return (
    <>
      {isLoading ? <Loading/> :
      <Box sx={{ width: `calc(100% - 13%)`, ml: `13%`}}>
        <Box sx={{display:"flex", justifyContent:"center", mt:2}}>
          <Alert severity="info">
            <AlertTitle><strong>Activity Page</strong></AlertTitle>
            This page shows the overall metric distribution for the pull requests. You can filter the data by using the filters on the left side of the page. <br/>
          </Alert>
        </Box>
        <Box sx={{display:"flex", flexDirection:"column", mt:"3%", ml:"4%"}}>
          <Box sx={{display:"flex", justifyContent:"space-between"}}>
            <Box sx={{flex:3, mr:"2%"}}>
              <LineChart prInfos={unfilteredData} filterSet={filterSet}/>
            </Box>
            <Divider orientation="vertical" flexitem="true"/>
            <Box sx={{ ml:2, flex:0.95, maxWidth:3/5}}>
              <FilterGroup onFilterChange={handleFilterChange}/>
            </Box>
          </Box>
        </Box>  
      </Box>
      }
    </>
  )
}
