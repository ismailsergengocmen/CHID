import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import {Toolbar,Select,ListItemText,ListItemButton,ListItem,Divider,Typography,List,CssBaseline,Button,Box,MenuItem,InputLabel,Paper,Drawer,Chip, Stepper, Step, StepLabel, Grid} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UpBar from '../components/UpBar';
import Logo from '../icons/appLogoLow.png';
import { fetchCurrentUser } from '../actions/userActions.js';

const logoSize = { width: "100%", height: "auto"};

const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
	...theme.typography.body2,
	padding: theme.spacing(4),
	textAlign: 'left',
	color: 'black',
}));

const projects = [
  {
    projectName: 'Project 1',
    ownerName: 'John Doe',
    tags: ['Tag1', 'Tag2', 'Tag3'],
    state: 2,
  },
  {
    projectName: 'Project 2',
    ownerName: 'Jane Doe',
    tags: ['Tag1', 'Tag4'],
    state: 0,
  },
  // Add more projects as needed
];

export default function MyProjects() {
	const navigate = useNavigate();
	const [value, setValue] = React.useState('one');

	const [searchParams] = useSearchParams();
	const dispatch = useDispatch();

	useEffect(() => {
		if (searchParams.get('from_login') === 'true') {
			dispatch(fetchCurrentUser());
		}
	}, [dispatch, searchParams]);

	return (
		<>
			<UpBar />
			<Drawer sx={{ width: "13%", flexShrink: 0, '& .MuiDrawer-paper': { width: "13%", boxSizing: 'border-box'}}} variant='permanent' anchor='left'>
				<img src={Logo} alt='Logo' style={logoSize} />
				<Divider/> 
					<Typography variant='h5' component='div' align='center'> 
						Filters 
					</Typography>
				<Divider/>
			</Drawer>
			<Box sx={{width:`calc(100% - 13%)`, ml: `13%`}}>
				<Grid container spacing={2}>
					{projects.map((project, index) => (
						<Grid item xs={4} key={index}>
							<Item sx={{ my: 2 }} elevation={5}>
								<h2>{project.projectName}</h2>
								<p>Owner: {project.ownerName}</p>
								<p>Tags: {project.tags?.join(', ')}</p>
								<Stepper activeStep={project.state}>
									<Step>
										<StepLabel>State 1</StepLabel>
									</Step>
									<Step>
										<StepLabel>State 2</StepLabel>
									</Step>
									<Step>
										<StepLabel>State 3</StepLabel>
									</Step>
								</Stepper>
							</Item>
						</Grid>
					))}
				</Grid>
			</Box>
		</>
	);
}
