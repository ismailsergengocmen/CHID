import React from 'react'
import AdminRepo from "../components/AdminRepo";
import AdminSideBar from "../components/AdminSideBar";
import { styled } from '@mui/material/styles';
import {Toolbar, Select, ListItemText, ListItemButton, ListItem, Divider, Typography, List, CssBaseline,
        Button, Box, FormControl, MenuItem, InputLabel, Grid, Paper, Drawer, Chip, TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import UpBar from '../components/UpBar';
import Logo from "../icons/appLogoLow.png";
import { useState } from 'react';


const AdminProjects = ({adminRepoInfos}) => {
    const navigate = useNavigate();
    
    return (
        <>
            <UpBar/>
            <AdminSideBar />
            <Box sx={{ width: `calc(100% - 13%)`, ml: `13%` }}>
                <AdminRepo adminRepoInfos={adminRepoInfos} />
            </Box>
        </>
    )
}

export default AdminProjects