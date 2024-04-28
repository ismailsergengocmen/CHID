import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import pageNotFound from '../icons/pageNotFound.gif';

export default function Page404() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#ADD8E6',
      }}
    >
      <Typography variant="h1" style={{ color: 'white' }}>
        404
      </Typography>
      <Typography variant="h6" style={{ color: 'white', marginBottom: '2rem' }}>
        The page you’re looking for doesn’t exist.
      </Typography>
      <Box width="50%">
        <img
          src={pageNotFound}
          alt="404"
          style={{
            width: '70%',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </Box>
      <Button variant="contained" sx={{my:2}}onClick={() => navigate("/myProjects")}>Back Home</Button>
    </Box>
  );
}