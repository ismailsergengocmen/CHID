import React from 'react'
import {Toolbar, Select, ListItemText, ListItemButton, ListItem, Divider, Typography, List, CssBaseline,
        Button, Box, FormControl, MenuItem, InputLabel, Grid, Paper, Drawer, Chip, TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import Logo from "../icons/appLogoLow.png";

const drawerWidth = 240;
const compWidth = drawerWidth + 20;

const logoSize = {
    width: 240,
    height: 180,
}

export default function AdminSideBar(){
    const [value, setValue] = React.useState('one');
    const [branch, setBranch] = React.useState('');
    const [personName, setPersonName] = useState('');

    const changeBranch = (event) => {
        setBranch(event.target.value);
    };

    const changeName = (event) => {
        setPersonName(event.target.value);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Drawer
                sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
                }}
                variant="permanent"
                anchor="left"
            >
                <img src={Logo} alt="Logo" style={logoSize}/>
                <Divider />
                <Box>
                    <SearchIcon sx={{ color: 'action.active', mt: 2.5, mx: 2}} />
                    <TextField id="input-with-sx" label="Name" variant="standard" onChange={changeName}/>
                </Box>
                <Box display='flex' flexDirection="row" sx={{my:2}}>
                    <InputLabel id="demo-simple-select-label" sx={{mr:2}}>Repositories</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={branch}
                        label="Branch"
                        onChange={changeBranch}
                        displayEmpty
                    >
                        <MenuItem value={"Pass"}>Backend</MenuItem>
                        <MenuItem value={"Failed"}>Frontend</MenuItem>
                    </Select>
                </Box>
            </Drawer> 
        </Box>
    )
}
