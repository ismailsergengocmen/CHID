import * as React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const [value, setValue] = React.useState('one');
	const path = window.location.pathname;

  // Update the tabs value based on the last piece of the URL
  React.useEffect(() => {
		if (path.includes('pullRequestSummary')) {
			setValue('summary');
		} else if (path.includes('measures')) {
			setValue('measures');
		} else if (path.includes('impact')) {
			setValue('impact');
		} 
  }, [path]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor='secondary'
        indicatorColor='secondary'
        aria-label='secondary tabs example'
      >
        <Tab
          value='summary'
          label='Summary'
          onClick={() => navigate('pullRequestSummary')}
        />
        <Tab
          value='measures'
          label='Measures'
          onClick={() => navigate('measures')}
        />
        <Tab
          value='impact'
          label='Impact'
          onClick={() => navigate('impact')}
        />
      </Tabs>
    </Box>
  );
}