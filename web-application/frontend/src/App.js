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
					<Route path='/myProjects' element={<MyProjects />} />
					<Route path='/createProject' element={<CreateProject />} />
					<Route path='/repositories/:repoID' element={<Bars isOverview={true} />}>
						<Route path='overview' element={<Overview />} />
						<Route path='overview/activity' element={<Activity />} />
						<Route path='pullRequests' element={<PullRequests />} />
						<Route path='settings' element={<Navigate to='analysisMetrics' />} />
						<Route path='settings/*' element={<ProjectSettings />} />
					</Route>
					<Route path='/repositories/:repoID/pullRequests/:prNumber' element={<Bars isOverview={false} />}>
						<Route path='measures' element={<Navigate to='codeChurn' />} />
						<Route path='measures/*' element={<Measures />} />
						<Route path='impact' element={<Impact />} />
						<Route
							path='pullRequestSummary'
							element={
								<PullRequestSummary />
							}
						/>
					</Route>
					<Route path="*" element={<Page404/>} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
