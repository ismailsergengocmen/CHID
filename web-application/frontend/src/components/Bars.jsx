import React from 'react';
import SideBar from './SideBar';
import UpBar from './UpBar';
import TabBar from './TabBar';
import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';

export default function Bars({ isOverview }) {
	return (
		<>
			<SideBar />
			<Box
				direction='column'
				justifyContent='space-between'
				sx={{
					width: `calc(100% - 13%)`,
					ml: `13%`,
				}}
			>
				<UpBar />
				{isOverview ? '' : <TabBar />}
			</Box>
			<Outlet />
		</>
	);
}
