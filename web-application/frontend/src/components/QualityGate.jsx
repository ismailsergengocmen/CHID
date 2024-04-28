import * as React from 'react';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { Typography, Paper, Grid, styled } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { red, green } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: red[500],
    },
		secondary: {
			main: green[500],
		}
  },
});

const Item = styled(Paper)(({ theme, qualityStatus }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  borderRadius: 20,
	border: `1px solid ${qualityStatus ? theme.palette.secondary.main : theme.palette.primary.main}`,
	boxShadow: `0px 5px 15px rgba(0, 0, 0, 0.1)`,
}));

export default function QualityGate({qualityStatus}) {
  return (
    <ThemeProvider theme={theme}>
      <Item sx={{mt:2.5}} qualityStatus = {qualityStatus}>
        {qualityStatus == true ? <DoneIcon color="success"/> : <CloseIcon color="warning"/>}
        <Typography>{qualityStatus == true ? "Quality Gate Passed" : "Quality Gate Failed"}</Typography>
      </Item>
    </ThemeProvider>
  );
}