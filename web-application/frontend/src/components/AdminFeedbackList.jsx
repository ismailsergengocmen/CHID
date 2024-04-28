import * as React from 'react';
import { Typography, Box, Paper, Grid, Rating, styled, Link, Button } from '@mui/material';
import UpBar from './UpBar';
import AdminSideBar from './AdminSideBar';
import { useNavigate } from 'react-router-dom';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(4),
    textAlign: 'left',
    color: 'black',
}));

const compWidth = 280;

export default function AdminFeedbackList({ feedback }) {
    const [value, setValue] = React.useState(2);
    const navigate = useNavigate();

    const handleClick = (nav) => {
        const route = "../" + nav
        navigate(route)
    }

    return (
        <Box display="flex" flexDirection="column" sx={{my:2}}>
            {feedback.map((repoInfo, key) => (
                <Item sx={{ m:2, width:7/10}}>
                    <Rating
                        name="simple-controlled"
                        value={value}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                    />
                    <Typography>{repoInfo.authorName}'s Feedback</Typography>
                    <Typography>Role: {repoInfo.role}</Typography>
                    <Typography>Analysis ID: <Link onClick={() => handleClick("/pullRequestSummary")} sx={{cursor: "pointer"}}>{repoInfo.id}</Link></Typography>
                    <Typography>{repoInfo.comment}</Typography>
                    <Button> Marked as Read</Button>
                </Item>
            ))}
        </Box>
    );
}