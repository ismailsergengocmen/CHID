import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { TableContainer, Card, CardContent, Typography, Box, Divider } from '@mui/material';
import QualityGate from './QualityGate';

const commonStyles = {
	bgcolor: 'background.paper',
	borderColor: 'text.primary',
	m: 1,
	border: 1,
};

export default function CardList({data}) {
	const navigate = useNavigate();
	const {repoID} = useParams();
	const [rows, setRows] = useState([]);

	useEffect(() => {
		let temp = data
		if(data.length >= 20){
			temp = data.slice(0, 20);
		}
		setRows(temp);
	}, [data]);

	return (
		<TableContainer
			sx={{ ...commonStyles, width: 8 / 10, mx: 5, mt: 2, maxHeight: 600, overflow: 'auto', borderRadius: 1 }}
			display='flex'
			flexDirection='column'
		>
			{rows.map((key, index) => (
				<Card
					sx={{ minWidth: 275, my: 2, cursor: 'pointer' }}
					elevation={8}
					onClick={() => navigate(`/repositories/${repoID}/pullRequests/${key['number']}/pullRequestSummary`)}
				>
					<CardContent>
						<Box display='flex' flexDirection='row' justifyContent='space-between'>
							<Box display='flex' flexDirection='column' width={"20%"}>
								<Typography sx={{ mb:1.5 }} gutterBottom>
									<strong sx={{ color: 'black' }}> PR Number: </strong>{key['number']} 
								</Typography>
								
								<Typography sx={{ mb: 1.5, fontSize: 15, overflow: 'hidden !important'}} noWrap>
									<strong sx={{ color: 'black' }}> PR Title: </strong> {key['name']} 
								</Typography>
									
								<Typography sx={{ mb: 1.5, fontSize: 14 }}>
									<strong> Created At: </strong> {key['creationTime']}
								</Typography>
							</Box>
							<Box sx={{display: "flex", flexDirection: "column", alignItems: "center", width: "60%"}}>
								<Typography noWrap display="inline" sx={{ textDecoration: "underline", position: "sticky", top: 0, color: "black"}}>
									<strong>Description</strong>
								</Typography>
								<Box sx={{ marginTop: 2, maxHeight: "2.5rem", overflow: "hidden", textOverflow: "ellipsis"}} flexItem>
									<Typography sx={{ mb: 1.5, fontSize: 14, overflow: 'hidden !important' }}>
										{key["description"]}
									</Typography>
								</Box>
							</Box>
							<QualityGate qualityStatus={key['qualityGateStatus']} />
						</Box>
						<Divider sx={{ mt: 2 }} />
						<Box display='flex' flexDirection='row' justifyContent='space-around' mt={2}>
							<Typography variant='body2'>
								<strong> Risk Score: </strong> <span> {key['riskScoreDetails']} </span>
							</Typography>
							<Typography variant='body2'>
								<strong> Highly Buggy File Rate: </strong><span> {key['highlyBuggyRate']} </span>
							</Typography>
							<Typography variant='body2'>
								<strong> Highly Churned File Rate: </strong><span> {key['highlyChurnRate']} </span>
							</Typography>
						</Box>
					</CardContent>
				</Card>
			))}
		</TableContainer>
	);
}
