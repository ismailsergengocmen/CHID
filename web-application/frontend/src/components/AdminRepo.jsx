import * as React from 'react';
import { Typography, Box, Paper, Grid, styled, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(4),
    textAlign: 'left',
    color: 'black',
}));

export default function AdminRepo({adminRepoInfos}) {
    const navigate = useNavigate();
    return (
        <Box display="flex" flexDirection="column" sx={{my:2}}>
            {adminRepoInfos.map((repoInfo, key) => (
                <Item sx={{ m:2, width:7/10}}>
                    <Typography>Repo Name: {repoInfo.projectName}</Typography>
                    <Typography>Created by: {repoInfo.authorName}</Typography>
                    <Typography>Created at: {repoInfo.lastAnalysis}</Typography>
                    <Typography>Lines of code: {repoInfo.loc}</Typography>
                    <Button onClick={ () => navigate("/adminFeedbacks")}> See Feedbacks</Button>
                </Item>
            ))}
        </Box>
    );
}