import express from 'express';
import {
	fetchCollaborators,
	removeCollaborator,
	changeCollaboratorRole,
} from '../controllers/collaboratorsController.js';

const router = express.Router({ mergeParams: true });

router.route('/').get(fetchCollaborators);
router.route('/:collaboratorID').put(changeCollaboratorRole).delete(removeCollaborator);

export default router;
