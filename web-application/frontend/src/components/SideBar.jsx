import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Drawer, Typography, InputLabel, MenuItem, Divider, Select } from '@mui/material';
import Logo from '../icons/appLogoLow.png';
import backendClient from '../config/axiosConfig';
import { Chip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeMerge} from '@fortawesome/free-solid-svg-icons'

const logoSize = {
	width: "100%",
	height: "auto",
};

export default function Sidebar() {
	const navigate = useNavigate();
	const {repoID} = useParams();
	const [projectName, setProjectName] = useState('');

	const [value, setValue] = useState('one');
	const [branch, setBranch] = useState('Main');

	const valueChange = (event, newValue) => {
		setValue(newValue);
	};

	const changeBranch = (event) => {
		setBranch(event.target.value);
	};

	useEffect(() => {
		const getGeneralInformation = async () => {
			const { data } = await backendClient.get(`/api/repositories/${repoID}/generalInformation`);
			setProjectName(data.name);
		}

		getGeneralInformation();
	}, [repoID])

	return (
		<Drawer
			sx={{
				flexShrink: 0,
				'& .MuiDrawer-paper': {
					width: "13%",
					boxSizing: 'border-box',
				},
			}}
			variant='permanent'
			anchor='left'
		>
			<Box component='img' src={Logo} alt='Logo' style={logoSize} margin='0' />
			<Divider flexitem="true" />
			<Box sx={{ my: 2 }}>
				<Typography variant='h5' align='center'>
					{projectName}
				</Typography>
			</Box>
			<Divider flexitem="true" />
			<Box display='flex' flexDirection='column'>
				<Box display='flex' flexDirection='row' justifyContent="center" sx={{ my: 1.5 }}>
					{/* <InputLabel id='demo-simple-select-label' sx={{ mr: 2 }}>
						Branch
					</InputLabel>
					<Select
						labelId='demo-simple-select-label'
						id='demo-simple-select'
						value={branch}
						label='Branch'
						onChange={changeBranch}
						displayEmpty
					>
						<MenuItem value={'Main'}>Main</MenuItem>
						<MenuItem value={'Test'}>Test</MenuItem>
						<MenuItem value={'Version 1'}>Version 1</MenuItem>
					</Select> */}
					<Chip
						icon={<FontAwesomeIcon sx={{ mr: 5 }} icon={faCodeMerge} />}
						label={`${branch} Branch`}
						variant="outlined"
						sx={{ mr: 1 }}
					/>
				</Box>
				<Divider flexitem="true" />
				<Box display='flex' flexDirection='column' sx={{ my: 2 }}>
					<Button sx={{ my: 2 }} onClick={() => navigate(`/repositories/${repoID}/overview`)}>
						Overview
					</Button>
					{/* <Button sx={{ my: 2 }} onClick={() => navigate(`/repositories/${repoID}/branchSummary`)}>
						{branch} Branch
					</Button> */}
					<Button sx={{ my: 2 }} onClick={() => navigate(`/repositories/${repoID}/pullRequests`)}>
						Pull Requests
					</Button>
				</Box>
				<Divider flexitem="true" sx={{ mt: 10 }} />
				<Box display='flex' flexDirection='row' justifyContent="center" sx={{ my: 2 }}>
					<Button onClick={() => navigate(`/repositories/${repoID}/settings`)}> Project Settings </Button>
				</Box>
			</Box>
		</Drawer>
	);
}
