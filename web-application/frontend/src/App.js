import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { grey } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CreateProject from './pages/CreateProject';
import MyProjects from './pages/MyProjects';
import Login from './components/login';
import Measures from './pages/Measures';
import Activity from './pages/Activity';
import PullRequests from './pages/PullRequests';
import PullRequestSummary from './pages/PullRequestSummary';
import AdminProjects from './pages/AdminProjects';
import AdminFeedback from './pages/AdminFeedback';
import Impact from './pages/Impact';
import Overview from './pages/Overview';
import Bars from './components/Bars';
import BranchSummary from './pages/BranchSummary';
import ProjectSettings from './pages/ProjectSettings';
import Page404 from './pages/Page404';

import {
	branchInfo,
	repoInfo,
	pullRequestBasicInfo,
	adminRepoInfos,
	feedback,
	projects,
} from './data.js';

const theme = createTheme({
	palette: {
		primary: {
			main: '#1a73e8',
		},
		secondary: grey,
		background: {
      default: '#FAFAFB', // replace with your desired background color
    },
	},
});

function App() {
	return (
		<ThemeProvider theme={theme}>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Navigate replace to='/login' />} />
					<Route path='/login' element={<Login />} />
					<Route path='/myProjects' element={<MyProjects projects={projects} />} />
					<Route path='/createProject' element={<CreateProject projects={projects} />} />
					<Route path='/repositories/:repoID' element={<Bars isOverview={true} />}>
						<Route path='overview' element={<Overview repoInfo={repoInfo} />} />
						<Route path='overview/activity' element={<Activity info={branchInfo} />} />
						<Route path='pullRequests' element={<PullRequests />} />
						<Route path='settings' element={<Navigate to='analysisMetrics' />} />
						<Route path='settings/*' element={<ProjectSettings />} />
						<Route path='branchSummary' element={<BranchSummary branchInfo={branchInfo} />} />
					</Route>
					<Route path='/repositories/:repoID/pullRequests/:prNumber' element={<Bars isOverview={false} />}>
						<Route path='measures' element={<Navigate to='codeChurn' />} />
						<Route path='measures/*' element={<Measures info={pullRequestBasicInfo} />} />
						<Route path='impact' element={<Impact barInfo={pullRequestBasicInfo} />} />
						<Route
							path='pullRequestSummary'
							element={
								<PullRequestSummary />
							}
						/>
					</Route>
					<Route path='adminRepos' element={<AdminProjects adminRepoInfos={adminRepoInfos} />} />
					<Route path='adminFeedbacks' element={<AdminFeedback feedback={feedback} />} />
					<Route path="*" element={<Page404/>} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
