import * as React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AdminTabBar() {
  const navigate = useNavigate();
  const [value, setValue] = React.useState('one');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: `calc(100% - 13%)`, ml: `13%` }}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="secondary tabs example"
      >
        <Tab value="one" label="New Feedbacks"/>
        <Tab value="two" label="Old Feedbacks"/>
      </Tabs>
    </Box>
  );
}