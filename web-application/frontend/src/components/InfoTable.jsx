import * as React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import ArticleTwoToneIcon from '@mui/icons-material/ArticleTwoTone';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SpokeIcon from '@mui/icons-material/Spoke';

const commonStyles = {
  bgcolor: 'background.paper',
  borderColor: 'text.primary',
  m: 1,
  border: 1,
};

export default function InfoTable({tableType, rows}) {
  const [title, setTitle] = useState("Code Churn");
  const [atLeastOneCoChanged, setAtLeastOneCoChanged] = useState(false);
  const theme = createTheme();

  useEffect(() => {
    if(tableType == "codeChurn"){
      setTitle("Code Churn");
    }
    else if(tableType == "coChangedFrequency"){
      setTitle("Co-changed Frequency");
      isThereAnyCoChanged(rows);
    }
    else if(tableType == "bugFrequency"){
      setTitle("Bug Frequency");
    }
  },[tableType]);

  const isThereAnyCoChanged = (rows) => {
    for (let row of rows){
      if(row["coChangedFrequency"]){
        setAtLeastOneCoChanged(true);
        break;
      }
    }
  }
  

  const getNameOfFile = (name) => {
    let temp = name.split("/");
    return temp[temp.length-1];
  }

  const createTooltip = (name) => {
    const tooltip = "File path: " + name;
    return tooltip;
  }

  return (
    <Box sx={{width: "60%"}}>
    {tableType === "coChangedFrequency" ? (
      <TableContainer component={Paper} sx={{...commonStyles, width:9/10, mx:5, mt:2, maxHeight:600, overflow: 'auto'}} display="flex" flexDirection="col">
        {atLeastOneCoChanged ? 
          Object.values(rows).map((key,index) => (
            key["coChangedFrequency"] ? (
              <Table aria-label="simple table" sx={{mb:8}} key={index}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {key["coChangedFrequency"] ? (
                        <>
                          <Tooltip title={createTooltip(key["name"])} placement="top">
                            <SpokeIcon sx={{mx:1}} color="primary"/>
                          </Tooltip>
                          <strong>{getNameOfFile(key["name"])}</strong>
                        </>
                      ) : <strong> Files </strong> }
                    </TableCell>
                    <TableCell align="center">
                      <strong> Co Changed Frequency </strong>
                    </TableCell>
                    <TableCell align="left">
                      <strong> Co Change Count </strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(key["coChangedFrequency"]).map((key2,index2) => (
                    <TableRow
                      key={index2}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {key2[1][1] === 0 ? <Tooltip title={createTooltip(key2[0])}><ArticleTwoToneIcon sx={{mx:1}}/></Tooltip> : <Tooltip title={createTooltip(key2[0])}><ArticleTwoToneIcon sx={{mx:1, color: theme.palette.error.dark}}/></Tooltip>}
                        {key2[1][1] === 0 ? <span> {getNameOfFile(key2[0])} </span> : <span style={{ color: theme.palette.error.dark }}> {getNameOfFile(key2[0])} </span>}
                      </TableCell>
                      <TableCell align="center"> 
                        {key2[1][1] === 0 ? <span> {key2[1][0]} </span> : <span style={{ color: theme.palette.error.dark }}> {key2[1][0]} </span>}
                      </TableCell>
                      <TableCell align="center"> 
                        {key2[1][1] === 0 ? <span> {key2[1][2]} </span> : <span style={{ color: theme.palette.error.dark }}> {key2[1][2]} </span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null
          ))
          : 
          <TableRow>
            <TableCell align="center">
              <Typography>
                There are no co-changed files that passes current co change rate
              </Typography>
            </TableCell>
          </TableRow>
        }
      </TableContainer>
    ) : null}
    {tableType != "coChangedFrequency" &&
      <TableContainer component={Paper} sx={{...commonStyles,width:9/10, mx:5, mt:2, maxHeight:600, overflow: 'auto'}}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Files</strong>
              </TableCell>
              <TableCell align="right">
                  <strong>{title}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(rows).map((key,index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Tooltip title={createTooltip(key["name"])} placement="top">
                    <ArticleTwoToneIcon sx={{mx:1}}/>
                  </Tooltip>
                    {getNameOfFile(key["name"])}
                </TableCell>
                <TableCell align="right">{key[tableType]}</TableCell>
              </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    }
  </Box>
  );
}