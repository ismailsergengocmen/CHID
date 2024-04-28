import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import QualityGateDialog from './QualityGateDialog';

export default function AddConditionCheck({
	initQualityGate,
	enqueueSnackbar
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Box display='flex' flexDirection='row' justifyContent='flex-end' sx={{mt:2}}>
				<Button variant='outlined' onClick={() => setOpen(true)} sx={{mr:2}}>
					Add Condition
				</Button>
			</Box>
			<QualityGateDialog
				open={open}
				setOpen={setOpen}
				type='add'
				currMetric=''
				currValue=''
				initQualityGate={initQualityGate}
				enqueueSnackbar={enqueueSnackbar}
			/>
		</>
	);
}
