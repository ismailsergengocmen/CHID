import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Alert, AlertTitle } from "@mui/material"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Loading from "../components/Loading";
import { Paper } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import backendClient from '../config/axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListOl, faTag, faCodeMerge, faBoltLightning, faMagnifyingGlass, faClock, faPenToSquare} from '@fortawesome/free-solid-svg-icons'

const columns = [
  { field: 'id', headerName: "PR No", minWidth: 140, renderHeader: () => (
		<strong>
			{'PR No '}
			<FontAwesomeIcon icon={faListOl} />
		</strong>
	), }, 
  { field: 'title', headerName: "PR Title", minWidth: 480, renderHeader: () => (
		<strong>
			{'PR Title '}
			<FontAwesomeIcon icon={faTag} />
		</strong>
	), }, 
	{ field: 'author', headerName: "Author", width: 200, renderHeader: () => (
		<strong>
			{'Author '}
			<FontAwesomeIcon icon={faPenToSquare} />
		</strong>
	),},
	{ field: 'state', headerName: "State", width: 150, renderHeader: () => (
		<strong>
			{'State '}
			<FontAwesomeIcon icon={faCodeMerge} />
			{'   '}
		</strong>
	)},
  { field: 'riskScore', headerName: "Risk Score", width: 180, renderHeader: () => (
		<strong>
			{'Risk Score '}
			<FontAwesomeIcon icon={faBoltLightning} beat style={{"--fa-primary-color": "#dee10e", "--fa-secondary-color": "#2eacbd"}} />
		</strong>
		
	) }, 
  { field: 'createdAt', headerName: "Creation Time", width: 200, renderHeader: () => (
		<strong>
			{'Creation Time '}
			<FontAwesomeIcon icon={faClock} light/>
		</strong>
	) },
];

function createData(number, id, title, author, reviewers, riskScore, createdAt, state) {
	return {
		id: number,
		title: title,
		author: author,
		reviewers: reviewers,
		riskScore: riskScore,
		createdAt: createdAt,
		navID: id,
		state: state,
	};
}

function fixDate(timestamp) {
	const date = new Date(timestamp);
	const dateString = date.toLocaleDateString(); // Returns the date portion of the timestamp in the user's local time zone
	const timeString = date.toLocaleTimeString(); // Returns the time portion of the timestamp in the user's local time zone
	const formattedDate = `${dateString} ${timeString}`; // Combines the date and time strings
	return formattedDate;
}

export default function PullRequests() {
	const navigate = useNavigate();
	const { repoID } = useParams();
	const [pullRequests, setPullRequests] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const handleRowClick = (params) => {
		const navID = params.row.id;
		navigate(`${navID}/pullRequestSummary`);
	};

	useEffect(() => {
		const fetchPullRequests = async () => {
			const { data } = await backendClient.get(`/api/repositories/${repoID}/pullRequests`);
			const newRows = data.map((pullRequest) =>
				createData(
					pullRequest.number,
					pullRequest.id,
					pullRequest.title,
					pullRequest.author.name || pullRequest.author.login,
					pullRequest.reviewers.map((reviewer) => reviewer.name || reviewer.login).join(', '),
					pullRequest.analysis.risk_score.score,
					fixDate(pullRequest.createdAt),
					pullRequest.state
				)
			);
			setPullRequests(newRows);
			setIsLoading(false);
		};
		fetchPullRequests();
	}, [repoID]);

  return (
    isLoading ? <Loading/> :
    <Box sx={{ width: `calc(100% - 13%)`, ml: `13%`, height: "100%"}}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", my:"5%" }}>
      	<Alert severity="info">
          <AlertTitle><strong>Pull Request Page</strong></AlertTitle>
          You can see all pull request destinated to the main brach in this repository here
          <br/>You can also filter data in each column, change sort and hide columns as you like, using <MoreVertIcon/> button on the left side of each column
          <br/><strong>Click on a pull request to see detailed analysis of a pull request</strong>
        </Alert>
      </Box>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", my:"5%" }}>
      <Paper sx={{ width: '90%', overflow: 'hidden' }}>
        <DataGrid
          rows={pullRequests}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={handleRowClick}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
					slots={{
						toolbar: GridToolbar,
					}}
        />
      </Paper>
      </Box>
    </Box>
  )
}