import { useState } from 'react';
import { Switch, FormControlLabel, Select, MenuItem, TextField, Box, Button, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function FilterGroup({ onFilterChange }) {
  const [checkDate, setCheckDate] = useState(false);
  const [checkCategory, setCheckCategory] = useState(false);
  const [checkRole, setCheckRole] = useState(false);
  const [checkName, setCheckName] = useState(false);
  const [measure, setMeasure] = useState('riskScore');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');

  const changeName = (event) => {
    setName(event.target.value);
  };

  const changeRole = (event) => {
    setRole(event.target.value);
  };

  const changeCategory = (event) => {
    setCategory(event.target.value);
  };

  const changeMeasure = (event) => {
    setMeasure(event.target.value);
  };

  const enableDate = (event) => {
    setCheckDate(event.target.checked);
    setStartDate('');
    setEndDate('');
  };

  const enableCategory = (event) => {
    setCheckCategory(event.target.checked);
    setCategory('');
  };

  const enableRoleAndName = (event) => {
    setCheckRole(event.target.checked);
    setCheckName(event.target.checked);
    setName('');
    setRole('');
  };

  // function to send filter data to parent component
  const handleFilterChange = () => {
    onFilterChange({
      measure,
      startDate,
      endDate,
      category,
      role,
      name,
    });
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-around" alignItems="flex-start">
      <Typography variant="h6"> Filters </Typography>
      <Box sx={{ mt: 3 }}>
        <Select id="select-measure-select" value={measure} label="Measure" onChange={changeMeasure}>
          <MenuItem value="riskScore">Risk Score</MenuItem>
          <MenuItem value="codeChurn">Code Churn</MenuItem>
          <MenuItem value="bugFreq">Bug Frequency</MenuItem>
          <MenuItem value="prSize">Pull Request Size</MenuItem>
        </Select>
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          value="start"
          control={<Switch checked={checkDate} onChange={enableDate} />}
          label="Date"
          labelPlacement="start"
        />
        {checkDate && (
          <Box display="flex" flexDirection="column" sx={{ maxWidth: 200 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="From"
                inputFormat="MM/DD/YYYY"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} sx={{ my: 1 }} />}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="To"
                inputFormat="MM/DD/YYYY"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Box>
        )}
      </Box>

      <Box display="flex" flexDirection="column" alignItems="space-around">
        <FormControlLabel
          value="start"
          control={<Switch checked={checkCategory} onChange={enableCategory} />}
          label="Category"
          labelPlacement="start"
        />
        {checkCategory && (
          <Select
            labelId="select-category-label"
            id="select-category-select"
            value={category}
            label="Category"
            onChange={changeCategory}
            sx={{ maxWidth: 200 }}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="D">D</MenuItem>
            <MenuItem value="E">E</MenuItem>
          </Select>
        )}
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          value="start"
          control={<Switch checked={checkName} onChange={enableRoleAndName} />}
          label="Name & Role"
          labelPlacement="start"
        />
        <Box display="flex" flexDirection="column" alignItems="space-around">
          {checkName && (
            <TextField id="input-with-sx" label="Name" variant="standard" value={name} onChange={changeName} sx={{ mb: 2, maxWidth: 200 }} />
          )}
          {checkRole && (
            <Select
              labelId="filter-by-role-label"
              id="filter-by-role"
              value={role}
              label="Role"
              onChange={changeRole}
              sx={{ maxWidth: 200 }}
            >
              <MenuItem value="assignees">Assignee</MenuItem>
              <MenuItem value="reviewers">Reviewer</MenuItem>
              <MenuItem value="author">Author</MenuItem>
            </Select>
          )}
        </Box>
      </Box>
      <Button onClick={handleFilterChange}> Apply Filters </Button>
    </Box>
  );
}