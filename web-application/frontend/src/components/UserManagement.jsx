import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { List, ListItem, ListItemText, Chip, Divider, Box, Typography } from '@mui/material';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import UserManagementIcon from './UserManagmentIcon';
import backendClient from '../config/axiosConfig.js';

export default function UserManagement() {
	const { repoID } = useParams();
	const [collaborators, setCollaborators] = useState([]);

	const fetchCollaborators = async () => {
		const { data } = await backendClient.get(`/api/collaborators/${repoID}`);
		setCollaborators(data);
	};

	useEffect(() => {
		fetchCollaborators();
	}, [repoID]);

	return (
		<Box border={1} borderColor='text.primary' sx={{ width: 5.5 / 10, ml: 10, mt: 10 }}>
			<Box display="flex" flexDirection="column" sx={{ alignItems: 'center' }}>
				<Typography variant='h6' gutterBottom sx={{ml:2}}>
					User Management
				</Typography>
				<Typography variant='subtitle1' gutterBottom sx={{ml:2}}>
					Change user access level to analyses
				</Typography>
			</Box>
			<Typography variant='subtitle1' gutterBottom sx={{ml:2}}>
					{collaborators.length} members
				</Typography>
			<Divider />
			<List style={{ height: 375, overflowY: 'scroll' }}>
				{collaborators.map((collab) => {
					return (
						<>
							<ListItem>
								<ListItemText primary={collab.login} secondary='' />
								{collab.role === 'owner' ? <Chip label='Team Lead' /> : ''}
								<UserManagementIcon
									role={collab.role}
									collabID={collab.id}
									name={collab.login}
									enqueueSnackbar={enqueueSnackbar}
									fetchCollaborators={fetchCollaborators}
								/>
							</ListItem>
							<Divider />
						</>
					);
				})}
			</List>
			<SnackbarProvider
				maxSnack={3}
				anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
				autoHideDuration={4000}
			/>
		</Box>
	);
}
