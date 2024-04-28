import { Typography, IconButton, Divider, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import HomeIcon from '@mui/icons-material/Home';

import { useNavigate } from 'react-router-dom';
import backendClient from '../config/axiosConfig';
import { useDispatch } from 'react-redux';
import { removeCurrentUser } from '../actions/userActions.js';

export default function UpBar() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const handleLogout = async () => {
		backendClient.post('/api/auth/logout').then(() => {
			dispatch(removeCurrentUser());
			navigate('/login');
		});
	};

	return (
		<Box
			display='flex'
			flexDirection={'row'}
			justifyContent='flex-end'
			margin='auto'
			sx={{ bgcolor: 'lightgrey' }}
		>
			<Box display='flex' flexDirection={'row'}>
				<IconButton
					aria-label='Add Project'
					size='medium'
					onClick={() => navigate('/createProject')}
				>
					<LibraryAddIcon fontSize='inherit' />
				</IconButton>
				<Divider orientation='vertical' />
				<IconButton
					aria-label='My Projects'
					size='medium'
					onClick={() => navigate('/myProjects')}
				>
					<HomeIcon fontSize='inherit' />
				</IconButton>

				<Divider orientation='vertical'  />
				
				<IconButton
					aria-label='logout'
					size='medium'
					onClick={handleLogout}
				>
					<LogoutIcon fontSize='inherit' />
				</IconButton>
			</Box>
		</Box>
	);
}
