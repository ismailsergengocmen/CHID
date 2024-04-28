import React from 'react'
import AdminFeedbackList from "../components/AdminFeedbackList";
import { Grid, Box, Typography, Rating } from "@mui/material";
import UpBar from '../components/UpBar';
import AdminSideBar from '../components/AdminSideBar';
import AdminTabBar from '../components/AdminTabBar';

const AdminFeedback = ({ feedback }) => {
    const [value, setValue] = React.useState(2);

    return (
        <>
            <UpBar/>
            <AdminTabBar/>
            <AdminSideBar/>
            <Box display="flex" flexDirection="column" justifyContent="center" sx={{ width: `calc(100% - 13%)`, ml: `13%`}}>
                <Typography component="legend">Average feedback given from this repository</Typography>
                <Rating
                    name="simple-controlled"
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                />
                <Typography> Feedback count from this repository: 2 </Typography>
                <AdminFeedbackList feedback={feedback}/>
            </Box>
        </>
    )
}

export default AdminFeedback