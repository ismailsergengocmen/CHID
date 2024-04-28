import * as React from 'react';
import { Box, Rating, Typography, Button, Dialog, DialogTitle, 
        DialogContent, DialogContentText, useMediaQuery, useTheme, DialogActions, TextField } from '@mui/material';

export default function Feedback() {
  const [value, setValue] = React.useState(2);
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Box>
        <Typography component="legend">Rate the Analysis</Typography>
        <Rating
          name="simple-controlled"
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            
          }}
        />
      </Box>
      <Button variant="outlined" onClick={handleClickOpen}>
        Give Feedback
      </Button>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <DialogContentText>
            Give Feedback
          </DialogContentText>
        </DialogContent>
        <TextField
          id="outlined-multiline-static"
          multiline
          fullWidth
        />
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Submit
          </Button>
          <Button onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box> 
  );
}