import * as React from 'react';
import { Card, CardContent, experimentalStyled as styled, Typography, Link, Paper, Divider } from '@mui/material';

const Item = styled(Paper)(({ theme, isDark }) => ({
	backgroundColor: isDark ? '#ededed' : '#FFF',
	padding: theme.spacing(2),
	textAlign: 'center',
	color: theme.palette.text.secondary,
	'&:hover': {
		cursor: 'default',
	},
	borderRadius: 20,
	border: `1px solid ${theme.palette.primary.main}`,
	boxShadow: `0px 5px 15px rgba(0, 0, 0, ${isDark ? '0.1' : '0.2'})`,
	// backgroundImage: `url(${wave})`,
	backgroundSize: 'cover',
	backgroundPosition: 'center',
}));

export default function AuthorCard({author}) {

  return (
    <Item>
      <Typography variant="h6" component="div" align='center' sx={{mb: 1, color: "black"}}>
        Author Information
      </Typography>
      <Divider/>
      <Typography color="text.secondary" gutterBottom sx={{my:1}}>
        Opened By: <Link onClick={() => window.open(author.url)} sx={{cursor: 'pointer'}}> {author["authorName"]}</Link>
      </Typography>
      <Typography >
        Risk Score Average: {author["riskAvg"]}
      </Typography>
      <Typography>
        Author Merge Rate: {author["mergeRate"]}
      </Typography>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
        Total # of pull requests: {author["pullReqCount"]}
      </Typography>
    </Item>
  );
}
