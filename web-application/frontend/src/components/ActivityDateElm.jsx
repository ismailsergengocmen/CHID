import * as React from 'react';
import {List, ListItemButton, ListItemIcon, ListItemText, Collapse} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';


export default function ActivityDateElm({pullRequestInfo}) {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return(
    <>
    <ListItemButton onClick={handleClick}>
      <ListItemIcon>
        <CalendarTodayIcon />
      </ListItemIcon>
      <ListItemText primary={pullRequestInfo.date}/>
      {open ? <ExpandLess /> : <ExpandMore />}
    </ListItemButton>
    <Collapse in={open} timeout="auto" unmountOnExit>
    <List component="div" disablePadding>
      {pullRequestInfo.hours.map((hour) => (
        <ListItemButton sx={{ pl: 4 }} key={hour}>
          <ListItemIcon>
            <AccessTimeIcon/>
          </ListItemIcon>
          <ListItemText primary={hour} />
        </ListItemButton>
      ))}
    </List>
    </Collapse>
    </>
  );
}

