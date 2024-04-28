import GitHubIcon from '@mui/icons-material/GitHub';
import { IconButton, Typography, Box, Chip, Avatar, Divider } from '@mui/material';

export default function PullRequestBar({info}) {
  const chipLabel = 
    <Box height="auto" display="flex" flexDirection="row" justifyContent="space-between" alignItems={"center"}>
      <Typography flexitem="true" sx={{mx:1}} color="black">
        <strong>Number:</strong> {info["prNumber"]} 
      </Typography>
      <Divider orientation="vertical" flexitem="true"/>
      <Typography flexitem="true" sx={{mx:1}} color="black">
        <strong>Title: </strong> {info["pullRequestName"]} 
      </Typography>
      <Divider orientation="vertical" flexitem="true"/>
      <Typography flexitem="true" sx={{mx:1}} color="black">
        <strong>Change Set: </strong> <span style={{color: "#4caf50"}}>+ {info["addedLineCount"]}</span> Added Lines &nbsp;
        <span style={{color: "#ef5350"}}>- {info["deletedLineCount"]} </span> Deleted Lines &nbsp; <span style={{color: "#ff9800"}}> {info["changedFileCount"]} </span> 
        Changed Files 
      </Typography>
      <Divider orientation="vertical" flexitem="true"/>
      <IconButton onClick={() => window.open(info.url)} flexitem="true" sx={{mx:1}} color="primary">
        <GitHubIcon/>
      </IconButton>
    </Box>
  
  return(
    <Chip
      avatar={<Avatar src="/static/images/avatar/1.jpg"> PR </Avatar>}
      label={chipLabel}
      variant="outlined"
      color="primary"
      sx={{ height: "auto", ml: `15%`, mb:"3%", mt:"1%"}}
    />
  )
}