import { useEffect,useState } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import { Divider,Typography,Button,Box,Paper,Drawer,Chip, Grid, Stepper, Step, StepLabel, Select, MenuItem, FormControl, InputLabel, IconButton} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UpBar from '../components/UpBar';
import Logo from '../icons/appLogoLow.png';
import { fetchCurrentUser } from '../actions/userActions.js';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FolderIcon from '@mui/icons-material/Folder';
import backendClient from '../config/axiosConfig.js';
import GitHubIcon from '@mui/icons-material/GitHub';
import Loading from '../components/Loading';

const logoSize = { width: "100%", height: "auto"};

const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
	...theme.typography.body2,
	padding: theme.spacing(3),
	textAlign: 'left',
	color: 'black',
}));

export default function MyProjects() {
	const navigate = useNavigate();
	const [projects, setProjectInfo] = useState([]);
	const [filters, setFilters] = useState({
    name: '',
    owner: '',
    tags: [],
  });
	const [filteredProjects, setFilteredProjects] = useState([]);
	const [allNames, setAllNames] = useState([]);
	const [allOwners, setAllOwners] = useState([]);
	const [allTags, setAllTags] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const [searchParams] = useSearchParams();
	const dispatch = useDispatch();

	useEffect(() => {
		if (searchParams.get('from_login') === 'true') {
			dispatch(fetchCurrentUser());
		}
	}, [dispatch, searchParams]);

	function onlyUnique(value, index, array) {
		return array.indexOf(value) === index;
	}

	useEffect(() => {
    const getRelatedRepositoryInfo = async () => {
      const {data} = await backendClient.get(`/api/repositories/user`);

			const projectTags = [];
			const projectNames = data.map((repo) => repo.name);
			const projectOwners = data.map((repo) => repo.owner);
			const uniqueProjectOwners = projectOwners.filter(onlyUnique);
			
			data.map((repo) => repo.tags.forEach((tag) => {
				if (projectTags.includes(tag)) {
					return;
				}
				else{
					projectTags.push(tag);
				}
			}));

			setAllNames(projectNames);
			setAllOwners(uniqueProjectOwners);
			setAllTags(projectTags);
			setProjectInfo(data);
			setFilteredProjects(data);
			setIsLoading(false);
		}

		getRelatedRepositoryInfo();
	}, [])

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

	const clearFilters = () => {
		setFilters({
			name: '',
			owner: '',
			tags: [],
		
		});
		setFilteredProjects(projects);
	}

	const applyFilters = () => {
		let filteredProjects = projects;

		if(filters.name != "" && filters.name != null){
			filteredProjects = filteredProjects.filter((project) => project.name == filters.name)
		}
		if(filters.owner != "" && filters.owner != null){
			filteredProjects = filteredProjects.filter((project) => project.owner == filters.owner)
		}
		if(filters.tags.length > 0 && filters.tags != null){
			// console.log(filters.tags);
			// console.log(filteredProjects.forEach((project) => project.tags.includes(filters.tags)))
			filteredProjects = filteredProjects.filter((project) => {
				return filters.tags.some(tag => project.tags.includes(tag));
			});
		}

		setFilteredProjects(filteredProjects);
	}

	return (
		isLoading ? <Loading /> : 
		<>
			<UpBar />
			<Drawer sx={{ width: "13%", flexShrink: 0, '& .MuiDrawer-paper': { width: "13%", boxSizing: 'border-box'}}} variant='permanent' anchor='left'>
				<img src={Logo} alt='Logo' style={logoSize} />
				<Divider/> 
					<Typography variant='h5' component='div' align='center'> Filters </Typography>
				<Divider/>
				<Box padding={2}>
				<FormControl fullWidth margin="normal">
          <InputLabel>Project Name</InputLabel>
					<Select
						name="name"
						value={filters.name}
						onChange={handleFilterChange}
						label="Project Name"
					>
						{allNames.map((name) => (
							<MenuItem key={name} value={name}>
								{name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<FormControl fullWidth margin="normal">
          <InputLabel>Project Owner</InputLabel>
					<Select
						name="owner"
						value={filters.owner}
						onChange={handleFilterChange}
						label="Project Owner"
					>
						{allOwners.map((owner) => (
							<MenuItem key={owner} value={owner}>
								{owner}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<FormControl fullWidth margin="normal">
					<InputLabel>Project Tags</InputLabel>
					<Select
						name="tags"
						value={filters.tags}
						onChange={handleFilterChange}
						label="Project Tags"
						multiple
					>
						{allTags.map((tag) => (
							<MenuItem key={tag} value={tag}>
								{tag}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<Box justifyContent={"center"} display={'flex'} sx={{my:2}}>
					<Button variant="contained" color="secondary" onClick={clearFilters}>Clear</Button>
				</Box>
				<Box justifyContent={"center"} display={'flex'} sx={{my:2}}>
						<Button variant="contained" onClick={applyFilters}>Apply Filters</Button>
				</Box>
      </Box>
			</Drawer>
			<Box sx={{width: `calc(100% - 13%px)`,	ml: `13%`, paddingLeft: 3, paddingRight: 3, paddingTop: 3}} display='flex' flexDirection='column' justifyContent='center'>
      <Grid container spacing={3}>
				{filteredProjects.map((repoInfo, key) => (
          <Grid item xs={4} key={key}>
            <Item sx={{ my: 2 }} elevation={5}>
              <Box display='flex' flexDirection='column'>
								<Box display="flex" flexDirection="row" justifyContent={"flex-end"}>
									<IconButton onClick={() => window.open("https://github.com/" + repoInfo.owner + "/" + repoInfo.name)}>
										<GitHubIcon/>
									</IconButton>
								</Box>
								<Box display="flex" flexDirection="row">
									<FolderIcon sx={{ m: 1 }}/>
									<Typography sx={{ m: 1 }}> <strong>Name:</strong> {repoInfo.name} </Typography>
								</Box>
								<Box display="flex" flexDirection="row">
									<AccountCircleIcon sx={{ m: 1 }}/>
                  <Typography sx={{ m: 1 }}> <strong>Owner:</strong> {repoInfo.owner} </Typography>
								</Box> 
								<Box display="flex" flexDirection="row"> 
									<LocalOfferIcon sx={{ m: 1 }}/>
									<Typography sx={{ m: 1 }}> <strong>Tags:</strong></Typography>
									{repoInfo.tags.length > 0 ? 
									repoInfo.tags.map((value, key) => (
										<Chip key={key} label={value} sx={{ m: 0.5 }}/>
									)) : <Typography sx={{ my: 1 }}> None </Typography>}
								</Box>
								<Stepper nonLinear alternativeLabel sx={{mt: 2}}>
									<Step completed={true}>
										<StepLabel>Add Project</StepLabel>
									</Step>
									<Step completed={repoInfo["is_initial_call_graph_built"]}>
										<StepLabel>Setup Call Graph</StepLabel>
									</Step>
									<Step completed={repoInfo["is_initial_analyze_finished"]}>
										<StepLabel>Initial Analysis</StepLabel>
									</Step>
								</Stepper>
								<Box display="flex" justifyContent="center" mt={2}>
                {repoInfo["is_initial_call_graph_built"] && repoInfo["is_initial_analyze_finished"] ? 
									<Button sx={{mt: 2, width:"50%"}} onClick={() => navigate(`/repositories/${repoInfo.id}/overview`)} variant="outlined">
										{' '} Open Project{' '}
									</Button> :
									<Button sx={{mt: 2}} disabled variant="outlined">
										{' '} Open Project{' '}
									</Button>
								}
								</Box>
              </Box>
            </Item>
          </Grid>
				))}
        </Grid>
			</Box>
		</>
	);
}