import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import QualityGateDialog from './QualityGateDialog';

export default function EditConditionCheck({
	currMetric,
	currValue,
	initQualityGate,
	enqueueSnackbar,
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<IconButton onClick={() => setOpen(true)} aria-label='edit'>
				<EditIcon />
			</IconButton>
			<QualityGateDialog
				open={open}
				setOpen={setOpen}
				type='edit'
				currMetric={currMetric}
				currValue={currValue}
				initQualityGate={initQualityGate}
				enqueueSnackbar={enqueueSnackbar}
			/>
		</>
	);
}
