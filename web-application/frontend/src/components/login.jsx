import React from 'react';
import './login.css';
import GithubButton from 'react-github-login-button';
import { Link, Navigate } from 'react-router-dom';
import { Box, Divider, Typography } from '@mui/material';
import Logo from '../icons/logo.png';

const logoSize = {
	width: "50%",
	height: "auto",
};

const Login = () => {

	const userInfo = localStorage.getItem('userInfo');

	return userInfo ? (
		<Navigate to='/myProjects' />
	) : (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Box display="flex" p={3}>
        <Box component="img" src={Logo} alt="Logo" sx={logoSize} margin="0" />
        <Divider orientation="vertical" flexItem sx={{ mx: 3 , ml: 2 }} />
        <Box display="flex" flexDirection={"column"} justifyContent={"space-around"}>
          <Typography variant="h4" gutterBottom flexItemm>
            Log in or Sign up to Change Impact Detector
          </Typography>
          <Link to="http://localhost:6002/api/auth/login" underline="none" flexItemm>
            <GithubButton />
          </Link>
          <Typography variant="body1" className="text" flexItemm>
            By logging in, you are agreeing to our Terms of Service
          </Typography>
        </Box>
      </Box>
    </Box>
	);
};

export default Login;

