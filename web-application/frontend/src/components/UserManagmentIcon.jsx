import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import backendClient from '../config/axiosConfig';

export default function UserManagementIcon({ role, collabID, name, enqueueSnackbar, fetchCollaborators }) {
	const { repoID } = useParams();
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const options =
		role === 'owner'
			? [
					{ label: 'Demote to developer', value: 'demote' },
					{ label: 'Remove from project', value: 'remove' },
			  ]
			: [
					{ label: 'Remove from project', value: 'remove' },
					{ label: 'Promote to team lead', value: 'promote' },
			  ];

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelection = async (option) => {
		try {
			let message;
			if (option === 'remove') {
				await backendClient.delete(`/api/collaborators/${repoID}/${collabID}`);
				message = `${name} is successfully removed.`;
			} else if (option === 'demote') {
				await backendClient.put(`/api/collaborators/${repoID}/${collabID}`, { newRole: 'collaborator' });
				message = `${name} is successfully demoted to developer.`;
			} else if (option === 'promote') {
				await backendClient.put(`/api/collaborators/${repoID}/${collabID}`, { newRole: 'owner' });
				message = `${name} is successfully promoted to team lead.`;
			}

			enqueueSnackbar(message, {
				variant: 'success',
			});
			await fetchCollaborators();
		} catch (err) {
			console.log(err.message);
			enqueueSnackbar('There was an error. Please try again.', {
				variant: 'error',
			});
		}
	};

	return (
		<div>
			<IconButton
				aria-label='more'
				id='long-button'
				aria-controls={open ? 'long-menu' : undefined}
				aria-expanded={open ? 'true' : undefined}
				aria-haspopup='true'
				onClick={handleClick}
			>
				<MoreVertIcon />
			</IconButton>
			<Menu
				id='long-menu'
				MenuListProps={{
					'aria-labelledby': 'long-button',
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
			>
				{options.map((option) => (
					<MenuItem key={option.label} onClick={() => handleSelection(option.value)}>
						{option.label}
					</MenuItem>
				))}
			</Menu>
		</div>
	);
}
