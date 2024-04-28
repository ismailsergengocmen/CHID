import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import QualityGate from "../components/QualityGate";
import Feedback from "../components/Feedback";
import Papers from "../components/Papers";
import { Box, Alert, AlertTitle} from "@mui/material";
import AuthorCard from "../components/AuthorCard";
import PullRequestBar from "../components/PullRequestBar";
import backendClient from '../config/axiosConfig.js';
import Loading from "../components/Loading";

const pullRequestSummaryCardKeys = ["riskScore", "codeChurn", "prevBugFreq", "coChangedFiles", "prSize"];
const pullRequestSummaryCardKeyCat = ["riskScoreCat", "codeChurnCat","previousBugFrequencyCat", "coChangedFilesCat", "prSizeCat"];
const pullRequestCardTitles = ["Risk Score", "Code Churn", "Previous Bug Frequency", "Co-changed Files", "Pull Request Size"];
const pullRequestCardUnits = ["Risk", "High Churn File", "File with High Frequency", "Missing Co-changed Files", "Lines of Code"];
const navigatePlaces = ["measures/riskScore", "measures/codeChurn", "measures/bugFrequency", "measures/coChangedFrequency"];
const cardTooltips = ["Risk Score is the probability of a pull request introducing a bug. It is calculated with several metrics such as code churn, previous bug frequency, pull request size, author merge rate and page rank score",
											"Code Churn represent cumulative change of a file throughout its life time. It is calculated by the cumulative total number of added and deleted lines divided by current loc value ",
											"Previous Bug Frequency is the frequency of bugs that a file has introduced in the past. It is calculated by the number of bug labeled pr that the file has introduced divided by the total number of commits that a file has.",
											"Co-changed Files are the files that changed together in past pull requests. It prompts the user to check the missing cochanged files if it exists",
											"Pull Request Size is the total number of changed lines of code"];

const pullRequestInfo = {
	riskScore: "",
	riskScoreCat: "",
	codeChurn: "",
	codeChurnCat: '',
	coChangedFiles: 0,
	prSize: '',
	prSizeCat: '',
	authorMergeRate: '',
	authorMergeRateCat: '',
	prevBugFreq: "",
	previousBugFrequencyCat: '',
	isPassed: "",
	problemCategories: [0, 0, 0, 0, 0],
	reasons: [0, 0, 0, 0, 0],
};

const author = { 
  "authorName": "",
  "riskAvg": "",
  "pullReqCount": "",
	"mergeRate": "",
  };

export default function PullRequestSummary() {
  const { repoID, prNumber } = useParams();
  const [prInfo, setprInfo] = useState(pullRequestInfo);
	const [authorInfo, setAuthorInfo] = useState(author);
	const [prBasicInfo, setPrBasicInfo] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [categoryThresholds, setCategoryThresholds] = useState({});

	useEffect(() => {
		const getPullRequest = async () => {
			const { data } = await backendClient.get(`/api/repositories/${repoID}/pullRequests/${prNumber}`);
			const settings = await backendClient.get(`/api/settings/${repoID}?part=metric_management`);
			const generalRepoInfo = await backendClient.get(`/api/repositories/${repoID}/generalInformation`);

			const co_change_threshold = settings.data.highly_co_change_file.file_threshold;
			const {problemCategories, reasons} = determineCategoryAndReasons(data.analysis.quality_gate.fail_reasons);
			const prInformation = {
				riskScore: data.analysis.risk_score.score.toString() + "%",
				riskScoreCat: changeNumberIntoCategory(data.analysis.risk_score.category),
				codeChurn: data.analysis.highly_churn_file_result.count,
				codeChurnCat: changeNumberIntoCategory(data.analysis.highly_churn_file_result.category),
        coChangedFiles: calculateMissingCoChangedFilesCount(data, co_change_threshold),
        prSize: data.lines.additions + data.lines.deletions,
        prSizeCat: changeNumberIntoCategory(data.analysis.pr_size_result.category),
        authorMergeRate: (data.author.cur_merged_pull_request_count / data.author.cur_pull_request_count) * 100,
        authorMergeRateCat: changeNumberIntoCategory(data.analysis.author_merge_rate_result.category),
        prevBugFreq: data.analysis.highly_buggy_file_result.count,
				previousBugFrequencyCat: changeNumberIntoCategory(data.analysis.highly_buggy_file_result.category),
        isPassed: data.analysis.quality_gate.status,
				problemCategories: problemCategories, 
				reasons: reasons, 
			};
			const authorInfo = {
				authorName: data.author.name ? data.author.name : data.author.login,
				url: "https://github.com/" + data.author.login,
				riskAvg: (data.author.cur_total_risk_score / data.author.cur_pull_request_count).toFixed(2) + "%",
				pullReqCount: data.author.cur_pull_request_count,
				mergeRate: ((data.author.cur_merged_pull_request_count / data.author.cur_pull_request_count) * 100).toFixed(2) + "%"
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

			const categoryThresholds = {
				"riskScoreCat": settings.data.risk_score,
				"codeChurnCat": settings.data.highly_churn_file,
				"previousBugFrequencyCat": settings.data.highly_buggy_file,
				"prSizeCat": settings.data.pr_size,
			}

			setprInfo(prInformation)
			setAuthorInfo(authorInfo)
			setPrBasicInfo(pullRequestBarInfo)
			setCategoryThresholds(settings.data)
			setIsLoading(false)
		};

		const changeNumberIntoCategory = (category) => {
			if (category == 0) {
				return 'A';
			}
			else if (category == 1) {
				return 'B';
			}
			else if (category == 2) {
				return 'C';
			}
			else if (category == 3) {
				return 'D';
			}
			else {
				return 'E';
			}
		}

		const determineCategoryAndReasons = (fail_reasons) => {
			let problemCategories = [0,0,0,0,0];
			let reasons = [0,0,0,0,0];

			for (let i = 0; i < fail_reasons.length; i++) {
				if (fail_reasons[i].includes("score")) {
					problemCategories[0] = 1;
					reasons[0] = fail_reasons[i];
				}
				else if (fail_reasons[i].includes("churn")) {
					problemCategories[1] = 1;
					reasons[1] = fail_reasons[i];
				}
				else if (fail_reasons[i].includes("buggy")) {
					problemCategories[2] = 1;
					reasons[2] = fail_reasons[i];
				}
				else if (fail_reasons[i].includes("size")) {
					problemCategories[4] = 1;
					reasons[4] = fail_reasons[i];
				}
			}
			
			return {problemCategories, reasons};
		}

    const calculateMissingCoChangedFilesCount = (pullRequest, co_change_threshold) => {
			const current_co_changes = pullRequest.analysis.current_co_changes
			const current_bug_frequencies = pullRequest.analysis.current_bug_frequencies // Contains file path and current pr count for every file
			const files_in_pr = pullRequest.files
			let missingCount = 0

			for (const file_in_current_co_change of current_co_changes) {
				const pr_count_of_file = current_bug_frequencies.find(file => file.path == file_in_current_co_change.path).current_pr_count

				for(const co_changed_file of file_in_current_co_change.current_co_change) {
					const change_rate = ((co_changed_file.co_change_rate / pr_count_of_file) * 100)
					const sibling_file_in_pr = files_in_pr.find(file => file.path == co_changed_file.path)
					if (!sibling_file_in_pr && change_rate >= co_change_threshold) {
						missingCount += 1
					}
				}
			}
			return missingCount
		}

		getPullRequest();
	}, [repoID, prNumber]);

  return(
    <>
		{isLoading ? <Loading/> :
			<>
      <PullRequestBar info={prBasicInfo}/>
      <Box sx={{ width: `calc(100% - 13%)`, ml: `13%`}}>
        <Box display="flex" justifyContent="space-around">
					<Box sx={{ maxHeight:"10%"}}>
          	<QualityGate qualityStatus={prInfo.isPassed} />
					</Box>
          <AuthorCard author={authorInfo}/>
					<Alert severity="info">
            <AlertTitle><strong>Summary Page</strong></AlertTitle>
            This page includes analysis results for each metric
            <ul style={{listStylePosition: "inside", paddingInlineStart: 0}}>
              <li style={{margin: "3% 0"}}>You can see cumulative author information </li>
              <li style={{margin: "3% 0"}}>The quality gate shows whether the pull request satisfy <br/>quality requirements determined in settings page</li>
              <li style={{margin: "3% 0"}}>You can see detailed view for each metric by clicking on them</li>
            </ul>
          </Alert>
        </Box>
        <Box sx={{width: 9/10, mt:15, ml: 8}}>
          <Papers prInfo={prInfo} cardKeys={pullRequestSummaryCardKeys}
                  cardKeyCats={pullRequestSummaryCardKeyCat} cardTitles={pullRequestCardTitles}
                  cardUnits={pullRequestCardUnits} navigatePlaces={navigatePlaces}
									cardTooltips={cardTooltips} categoryTooltips={categoryThresholds}/>
        </Box>
      </Box>
			</>
		}
    </>
  )
}