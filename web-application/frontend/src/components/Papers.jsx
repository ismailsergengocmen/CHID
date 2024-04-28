import * as React from 'react';
import { Box, Paper, Grid, experimentalStyled as styled, Tooltip, Chip, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { yellow, green } from '@mui/material/colors';
import './TooltipWithSquare.css'; // Import the CSS file for styling

const theme = createTheme({
  palette: {
    primary: {
      main: yellow[700],
    },
		secondary: {
			main: green[500],
		}
  },
});

const Item = styled(Paper)(({ theme, isdark }) => ({
	backgroundColor: isdark ? '#ededed' : '#FFF',
	padding: theme.spacing(2),
	textAlign: 'center',
	color: theme.palette.text.secondary,
	'&:hover': isdark ? null : {
		cursor: 'pointer',
	},
	borderRadius: 20,
	border: `1px solid ${theme.palette.primary.main}`,
	boxShadow: `0px 5px 15px rgba(0, 0, 0, ${isdark ? '0.1' : '0.2'})`,
	backgroundSize: 'cover',
	backgroundPosition: 'center',
}));

export default function Papers({ prInfo, cardKeys, cardTitles, cardKeyCats, cardUnits, navigatePlaces, cardTooltips, categoryTooltips }) {
	const navigate = useNavigate();
	const { repoID, prNumber } = useParams();

	console.log(categoryTooltips)

	const handleClick = (nav) => {
		if(nav){
			const route = `/repositories/${repoID}/pullRequests/${prNumber}/` + nav;
			navigate(route);
		}
	};

	const isdark = (cardKey) => {
		if (cardKey == "prSize"){
			return true;
		}
		return false;
	}

	const getColor = (cardKeyCatVal) => {
		if (cardKeyCatVal == "A"){
			return "success";
		}
		else if (cardKeyCatVal == "B"){
			return "secondary";
		}
		else if (cardKeyCatVal == "C"){
			return "primary";
		}
		else if (cardKeyCatVal == "D"){
			return "warning";
		}
		else {
			return "error";
		}
	}

	const createTooltip = (cardKeyCats) => {
		let type = "";
		let units = "";
		if (cardKeyCats == "riskScoreCat"){
			type = "risk_score";
			units = "%";
		}
		else if(cardKeyCats == "codeChurnCat"){
			type = "highly_churn_file";
			units = "%";
		}
		else if(cardKeyCats == "previousBugFrequencyCat"){
			type = "highly_buggy_file";
			units = "%";
		}
		else {
			type = "pr_size";
			units = "lines";
		}
		return (
			<> 
				<span> Current category thresholds <br/>
        <div className="square a"></div> A: {categoryTooltips[type].a.lower_bound} - {categoryTooltips[type].a.upper_bound} {units}<br />
        <div className="square b"></div> B: {categoryTooltips[type].b.lower_bound} - {categoryTooltips[type].b.upper_bound} {units}<br />
        <div className="square c"></div> C: {categoryTooltips[type].c.lower_bound} - {categoryTooltips[type].c.upper_bound} {units}<br />
        <div className="square d"></div> D: {categoryTooltips[type].d.lower_bound} - {categoryTooltips[type].d.upper_bound} {units}<br />
        <div className="square e"></div> E: {categoryTooltips[type].e.lower_bound} - {categoryTooltips[type].e.upper_bound} {units}<br />
				</span>
			</>
			)
	}

	return (
		<Grid container spacing={{ xs: 4, md: 12 }}>
			{cardKeys.map((key, index) => (
				<Grid item xs={2} sm={4} md={4} key={key}>
					<Item onClick={() => handleClick(navigatePlaces[index])} isdark={isdark(cardKeys[index])}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Box sx={{ marginX: 'auto' }}>
									<strong> {cardTitles[index]} </strong>
								</Box>
							</Box>
							<Box>
								<Tooltip title={cardTooltips[index]} placement="top">
									<HelpOutlineIcon color="primary"/>
								</Tooltip>
							</Box>
						</Box>
						<Box display="flex" flexDirection={"row"} justifyContent={"space-around"}>
							<Box sx={{mt:1}}>
							<span style={{cursor: "default"}}>
								{prInfo[key] == 0 ? "No": prInfo[key]}
							</span>{' '}
							{cardUnits[index]}
							</Box>
							{cardKeyCats[index] != "coChangedFilesCat" && (
							<Box>
								<ThemeProvider theme={theme}>
									<Tooltip title={createTooltip(cardKeyCats[index])} placement="top">
										<Chip label={prInfo[cardKeyCats[index]]} color={getColor(prInfo[cardKeyCats[index]])} />
									</Tooltip>
								</ThemeProvider>
							</Box>
							)}
						</Box>
						<Box sx={{mt:1}}>
							{prInfo['problemCategories'][index] === 1 ? (
								<span style={{ color: '#ef5350' }}> {prInfo['reasons'][index]} </span>
							) : null}
						</Box>
					</Item>
				</Grid>
			))}
		</Grid>
	);
}
