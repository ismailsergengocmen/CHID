import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useParams, useNavigate } from 'react-router-dom';
import backendClient from '../config/axiosConfig';
import { enqueueSnackbar } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';


export default function DeleteRepository() {
  const { repoID } = useParams();
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      await backendClient.delete(`/api/repositories/${repoID}`);
      enqueueSnackbar("Repository deleted successfully", {
        variant: "success",
      });
      
      navigate('/myProjects')
    } 
    catch (err) {
      enqueueSnackbar("There was an error. Please try again.", {
      variant: "error",
      });
    }
    }

return (
    <Box>
      <Button onClick={handleClickOpen} variant="contained" size="large" color="error" sx={{ mt: 4.5 }}>
        <DeleteIcon />
        Delete Repository
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Do you really want to delete the repository?"}
        </DialogTitle>
        <DialogContent>
        <Box style={{marginTop: '10px'}}>
          <Typography variant="subtitile2" gutterBottom> If you delete the repository, you and your team will no longer be able to see analyzes for pull requests </Typography>
      </Box>
      
    </DialogContent>
    <Box>
        <DialogActions>
          <Button onClick={handleDelete}>Yes</Button>
          <Button onClick={handleClose} autoFocus>
            No
          </Button>
        </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}