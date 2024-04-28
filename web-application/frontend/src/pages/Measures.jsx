import { useState, useEffect } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import InfoTable from "../components/InfoTable";
import { Box, Button, Alert, AlertTitle } from "@mui/material";
import PullRequestBar from "../components/PullRequestBar";
import backendClient from '../config/axiosConfig.js';
import DoughnutChart from "../components/DoughnutChart";
import Loading from "../components/Loading";

function createData(name, codeChurn, bugFrequency, coChangedFrequency) {
  return {"name": name, 
    "codeChurn": codeChurn, 
    "bugFrequency": bugFrequency, 
    "coChangedFrequency": coChangedFrequency};
}

export default function Measures() {
  const { repoID, prNumber } = useParams();
  const navigate = useNavigate(); 
  const [prBasicInfo, setPrBasicInfo] = useState({});
  const [measuresInfo, setMeasuresInfo] = useState([]);
  const [doughnutChartData, setDoughnutChartData] = useState({});
  const [riskScoreInfo, setRiskScoreInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPullRequest = async () => {
			const { data } = await backendClient.get(`/api/repositories/${repoID}/pullRequests/${prNumber}`);
      const settings = await backendClient.get(`/api/settings/${repoID}?part=metric_management`);
      const generalRepoInfo = await backendClient.get(`/api/repositories/${repoID}/generalInformation`);

      const co_change_threshold = settings.data.highly_co_change_file.file_threshold;

      const all_co_changes = calculateCoChangedFiles(data, co_change_threshold)
      const all_code_churns = data.analysis.current_code_churns
      const all_bug_freq = data.analysis.current_bug_frequencies
      const measures = []

      for (const file of all_bug_freq){
        const file_path = file.path
        const code_churn = all_code_churns.find(file => file.path == file_path)?.current_code_churn
        let code_churn_of_file;
        if(code_churn){
          code_churn_of_file = code_churn.toFixed(2)
        }
        else {
          code_churn_of_file = 0
        }
        const bug_frequency = all_bug_freq.find(file => file.path == file_path)?.current_bug_frequency * 100
        const bug_frequency_of_file = bug_frequency.toFixed(2) + "%"
        const co_changed_frequency = all_co_changes.find(file => file.path == file_path)?.current_co_change
        measures.push(createData(file_path, code_churn_of_file, bug_frequency_of_file, co_changed_frequency))
      }

      const pullRequestBarInfo = {
        prNumber: data.number,
				authorName: data.author.name ? data.author.name : data.author.login,
				addedLineCount: data.lines.additions,
				deletedLineCount: data.lines.deletions,
				changedFileCount: data.files.length,
				pullRequestName: data.title,
        url: data.url,
			}
      
      const riskScoreInfo = {
        riskScore: data.analysis.risk_score.score.toFixed(2) + "%",
        codeChurnResult: data.analysis.highly_churn_file_result.category,
        codeChurnCoefficient: 2.1,
        bugFrequencyResult: data.analysis.highly_buggy_file_result.category,
        bugFrequencyCoefficient: 3.4,
        prSizeResult: data.analysis.pr_size_result.category,
        prSizeCoefficient: 2.9,
        mergeRateResult: data.analysis.author_merge_rate_result.category,
        mergeRateCoefficient: 1.6
      }

      if(data.isAddedInIncrementalAnalysis){
        riskScoreInfo.codeChurnCoefficient = settings.data.risk_score.formula.highly_churn_file_coefficient
        riskScoreInfo.bugFrequencyCoefficient = settings.data.risk_score.formula.highly_buggy_file_coefficient
        riskScoreInfo.prSizeCoefficient = settings.data.risk_score.formula.pr_size_coefficient
        riskScoreInfo.mergeRateCoefficient = settings.data.risk_score.formula.author_merge_rate_coefficient
        riskScoreInfo.pageRankCoefficient = settings.data.risk_score.formula.page_rank_score_coefficient
        riskScoreInfo.pageRankResult = data.analysis.current_page_rank_result.category
        riskScoreInfo.pageRankCoefficient = settings.data.risk_score.formula.page_rank_score_coefficient
      }

      const doughnutChartData = {
        labels: ["Code Churn", "Bug Frequency", "Author Merge Rate", "PR Size"],
        datasets: [
          {
            label: "Risk Score Contribution",
            data: [
              (riskScoreInfo.codeChurnCoefficient * riskScoreInfo.codeChurnResult * 2.5).toFixed(2),
              (riskScoreInfo.bugFrequencyCoefficient * riskScoreInfo.bugFrequencyResult * 2.5).toFixed(2),
              (riskScoreInfo.mergeRateCoefficient * riskScoreInfo.mergeRateResult * 2.5).toFixed(2),
              (riskScoreInfo.prSizeCoefficient * riskScoreInfo.prSizeResult * 2.5).toFixed(2),
            ],
            backgroundColor: ['rgb(255, 205, 86)', 'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(76, 92, 92)'],
            borderColor: ['rgb(255, 205, 86)', 'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(76, 92, 92)'],
          }
        ]
      }
      
      if(data.isAddedInIncrementalAnalysis){
        doughnutChartData.labels.push("Page Rank")
        doughnutChartData.datasets[0].data.push((riskScoreInfo.pageRankCoefficient * riskScoreInfo.pageRankResult * 2.5).toFixed(2))
        doughnutChartData.datasets[0].backgroundColor.push('rgb(154, 102, 255)')
        doughnutChartData.datasets[0].borderColor.push('rgb(154, 102, 255)')
      };

      setMeasuresInfo(measures)
      setPrBasicInfo(pullRequestBarInfo)
      setDoughnutChartData(doughnutChartData)
      setRiskScoreInfo(riskScoreInfo)
      setIsLoading(false)
		};

    const calculateCoChangedFiles = (pullRequest, co_change_threshold) => {
			const all_co_changes = []
			const current_co_changes = pullRequest.analysis.current_co_changes
			const current_bug_frequencies = pullRequest.analysis.current_bug_frequencies // Contains file path and current pr count for every file
			const files_in_pr = pullRequest.files

			for (const file_in_current_co_change of current_co_changes) {
        const all_co_changes_of_file = {}
				const pr_count_of_file = current_bug_frequencies.find(file => file.path == file_in_current_co_change.path).current_pr_count

				for(const co_changed_file of file_in_current_co_change.current_co_change) {
					let change_rate = ((co_changed_file.co_change_rate / pr_count_of_file) * 100)
					const sibling_file_in_pr = files_in_pr.find(file => file.path == co_changed_file.path)
          const co_change_count = co_changed_file.co_change_rate

          if (change_rate >= co_change_threshold){
            let exist = 1
            if (sibling_file_in_pr){
              exist = 0
            }
            change_rate = change_rate.toFixed(2).toString() + "%"
            all_co_changes_of_file[co_changed_file.path] = [change_rate, exist, co_change_count]
            const temp = {
              path: file_in_current_co_change.path,
              current_co_change: all_co_changes_of_file,
              co_change_count: co_changed_file.co_change_rate
            }
            all_co_changes.push(temp);
          }
        }
      }
      return all_co_changes
    }

    getPullRequest();
  }, [repoID, prNumber])

  return (
    isLoading ? <Loading /> :
    <>
      <PullRequestBar info = {prBasicInfo} />
      <Box display="flex" flexDirection="row" sx={{ width: `calc(100% - 13%)`, ml: `13%`}} justifyContent={"space-around"}>
        <Box display="flex" flexDirection="column" sx={{mx: "2%", maxHeight:"50%", minHeight:"50%"}}>
          <Button sx={{my:2}} variant="outlined" onClick={() => navigate("riskScore")}>Risk Score</Button>
          <Button sx={{my:2}} variant="outlined" onClick={() => navigate("codeChurn")}>Code Churn</Button>
          <Button sx={{my:2}} variant="outlined" onClick={() => navigate("coChangedFrequency")}>Co-changed Frequency</Button>
          <Button sx={{my:2}} variant="outlined" onClick={() => navigate("bugFrequency")}>Bug Frequency</Button>
        </Box>
        <Routes>
          <Route path="riskScore" element={<DoughnutChart doughnutChartData={doughnutChartData} riskScoreInfo={riskScoreInfo}/>} />
          <Route path="codeChurn" element={<InfoTable tableType = {"codeChurn"} rows={measuresInfo}/>} />
          <Route path="coChangedFrequency" element={<InfoTable tableType = {"coChangedFrequency"} rows={measuresInfo}/>} />
          <Route path="bugFrequency" element={<InfoTable tableType = {"bugFrequency"} rows={measuresInfo}/>} />
        </Routes>
        <Box sx={{maxWidth:"30%", maxHeight:"30%", mr:"2%"}}>
        <Alert severity="info" sx={{mt:2}}>
          <AlertTitle><strong>Measures Page</strong></AlertTitle>
          This page includes detailed analysis results for each metric
          <ul style={{listStylePosition: "inside", paddingInlineStart: 0}}>
            <li style={{margin: "3% 0"}}><strong>Risk score: </strong> You can see each metrics' distribution to total risk score in the doughnut chart
            <br/><strong> Calculation method: </strong> See doughnut chart </li>
            <li style={{margin: "3% 0"}}><strong>Code churn:</strong> You can see every file's cumulative code churn is until the pr opened
            <br/><strong> Calculation method: </strong> Per file, Cumulative total added + deleted lines / Current LOC </li>
            <li style={{margin: "3% 0"}}><strong> Co changed frequency: </strong> You can see files that changed together in the changeset. The red color symbolizes the file is a co-changed file but it is not in the changeset. So, you should check it
            <br/><strong> Calculation method: </strong> Per combination of a file and it's sibling file, total pr count that they changed both / total pr count count file changed without the sibling file </li>
            <li style={{margin: "3% 0"}}><strong>Bug frequency: </strong> You can see bug frequency of every file in the changeset
            <br/><strong> Calculation method: </strong> Per file, Cumulative bug labeled pr count / total pr count that file exists in changeset</li>
          </ul>
        </Alert>
        </Box>
      </Box>
    </>
  )
}