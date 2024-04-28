import { useEffect, useState } from 'react';
import {Box, Button, Container, Grid, InputLabel, TextField, Typography, Autocomplete, Chip, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import UpBar from '../components/UpBar';
import backendClient from '../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

const InputWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '20px',
});

const Analysis = () => {
  const navigate = useNavigate();
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repoNames, setRepoNames] = useState([]);
  const [notification, setNotification] = useState('');
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSelectChange = (event) => {
    setSelectedRepo(event.target.value);
    console.log(event.target.value)
  };

  const handleTagChange = (event, value) => {
    setTags(value);
  };

  const startAnalysis = async () => {
    try {
      const response = await backendClient.post('/api/analysis/', {repo: selectedRepo, tags: tags });
      if (response.status === 200) {
        setNotification('Analysis started successfully');
        navigate("/myProjects")
      }
    } catch (error) {
      console.error(error);
    } 
  };

  useEffect(() => {
    const getRepoNames = async () => {
      try {
        const response = await backendClient.get('/api/analysis/user');
        if (response.status === 200) {
          setRepoNames(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getRepoNames();
    setIsLoading(false);
  }, []);

  return (
    isLoading ? <Loading/> :
    <>
    <UpBar/>
    <Container sx={{ marginTop: '50px' }}>
      <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: '30px' }}>
        Add a project
      </Typography>

      <Box sx={{ marginTop: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px', padding: '20px', marginBottom: "20px" }}>
        <Typography variant="h5" sx={{ marginBottom: '20px' }}>How to start an Analysis</Typography>
        <Typography variant="body1" component="ol">
          <li>Configure callgraph-server on your local server and start</li>
          <li>Clone your repository to your local server</li>
          <li>Configure Change Impact Detector's Github app</li>
          <li>Once you complete these steps, you can see your project analyses 🎉🎉</li>
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
            <InputLabel htmlFor="repoName">Repository Name:</InputLabel>
            <Select
              id="repoName"
              type="text"
              value={selectedRepo}
              onChange={handleSelectChange}
            >
              {repoNames.map((item) => (
                <MenuItem key={item.id} value={item}>{item.name}</MenuItem>
              ))}
            </Select>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <InputWrapper>
            <InputLabel>Tags:</InputLabel>
              <Autocomplete
                multiple
                id="tags-filled"
                options={[]}
                defaultValue={[]}
                freeSolo
                value={tags}
                onChange={handleTagChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                  />
                )}
              />
          </InputWrapper>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={startAnalysis}>
            Start Analysis
          </Button>
        </Grid>
      </Grid>

      {notification && (
        <Box sx={{ marginTop: '30px', backgroundColor: '#e6f4ff', borderRadius: '5px', padding: '20px' }}>
          <Typography variant="body1">{notification}</Typography>
        </Box>
      )}
    </Container>
    </>
  );
};

export default Analysis;