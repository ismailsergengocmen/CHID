import express from 'express';
import {
	getRepositories,
	getRepositoryById,
	getOverview,
	getGeneralInformation,
	getRepositoriesThatUserCanAccess,
	deleteRepositoryFromAnalysis
} from '../controllers/repositoryController.js';

const router = express.Router();

router.route('/').get(getRepositories);
router.route('/user').get(getRepositoriesThatUserCanAccess);
router.route('/:repoID').get(getRepositoryById).delete(deleteRepositoryFromAnalysis);
router.route('/:repoID/overview/languages').get(getOverview);
router.route('/:repoID/generalInformation').get(getGeneralInformation);

export default router;
