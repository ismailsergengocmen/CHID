import { Box, Button, Typography, Tooltip, Alert, AlertTitle } from '@mui/material';
import AnalysisMetrics from '../components/AnalysisMetrics';
import CategoryManagement from '../components/CategoryManagement';
import QualityGateSettings from '../components/QualityGateSettings';
import UserManagement from '../components/UserManagement';
import DeleteRepository from '../components/DeleteRepository';
import { Route, Routes, useNavigate } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function ProjectSettings() {
	const navigate = useNavigate();

	const analysisMetricsTooltip = [
		"You can customize bot's comment in the analysis metrics section. The comments will be structured depending on your selections",
		"You can select category limits and threshold values for each metric in the metric management section. Your choice will be applied to the analysis from now on",
		"You can determine the specifications of the quality gate for your project in the quality gate section. The quality gate will be applied to the analysis from now on",
		"You can remove users from your project or select new team leader in the user management section."
	]

	return (
		<>
			<Box sx={{ width: `calc(100% - 13%)`, ml: `13%`}}>
				<Box display='flex' flexDirection='row' justifyContent='space-around'>
					<Alert severity="info" sx={{mt: 4}}>
            <AlertTitle><strong>Settings Page</strong></AlertTitle>
            Dashboard for changing analysis metrics and controlling project users<br/>
          </Alert>
				</Box>
				<Box display='flex' flexDirection='row'>
					<Box display='flex' flexDirection='column' justifyContent='space-around' sx={{mt: 8}}>
						<Button sx={{ m: 2 }} onClick={() => navigate('analysisMetrics')} variant='outlined' key='analysisMetrics'>
							Analysis Metrics
							<Tooltip title={analysisMetricsTooltip[0]} placement="top" sx={{ml: 1}}>
								<HelpOutlineIcon color="primary"/>
							</Tooltip>
						</Button>
						<Button sx={{ m: 2 }} onClick={() => navigate('metricManagement')} variant='outlined' key='metricManagement'>
							Metric Management
							<Tooltip title={analysisMetricsTooltip[1]} placement="top" sx={{ml: 1}}>
								<HelpOutlineIcon color="primary"/>
							</Tooltip>
						</Button>
						<Button sx={{ m: 2 }} onClick={() => navigate('qualityGateSettings')} variant='outlined' key='QualityGateSettings'>
							Quality Gate
							<Tooltip title={analysisMetricsTooltip[2]} placement="top" sx={{ml: 1}}>
								<HelpOutlineIcon color="primary"/>
							</Tooltip>
						</Button>
						<Button sx={{ m: 2 }} onClick={() => navigate('userManagement')} variant='outlined' key='UserManagement'>
							User Management
							<Tooltip title={analysisMetricsTooltip[3]} placement="top" sx={{ml: 1}}>
								<HelpOutlineIcon color="primary"/>
							</Tooltip>
						</Button>
					</Box>
					<Routes>
						<Route path='/analysisMetrics' element={<AnalysisMetrics />} />
						<Route path='/metricManagement' element={<CategoryManagement />} />
						<Route path='/qualityGateSettings' element={<QualityGateSettings />}/>
						<Route path='/userManagement' element={<UserManagement />}/>
					</Routes>
				</Box>
				<Box display={"flex"} justifyContent={"center"}>
					<DeleteRepository />
				</Box>
			</Box>
		</>
	);
}
