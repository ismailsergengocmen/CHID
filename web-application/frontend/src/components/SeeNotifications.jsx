import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function SeeNotifications() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
        <Box>
          <Button style={{marginLeft : '820px', marginTop: 'px' }} variant="outlined" onClick={handleClickOpen} startIcon={<NotificationsIcon />}>
            See Notifications
          </Button>
        </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Notifications"}
        </DialogTitle>
        <DialogContent>
        <Box style={{marginTop: '10px'}}>
        <Typography variant="h6"  gutterBottom> Ahmet Salih Cezayir wants to demote Ezgi Lena Sönmez to developer </Typography>
      </Box>
      
      </DialogContent>
      <Box>
        <DialogActions>
          <Button style={{marginRight : '10px', marginBottom: '10px'}} onClick={handleClose}>Accept</Button>
          <Button style={{marginRight : '10px', marginBottom: '10px'}}onClick={handleClose} autoFocus>
            Decline
          </Button>
        </DialogActions>
        </Box>
      </Dialog>
      
    </div>
  );
}