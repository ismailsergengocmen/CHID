import express from 'express';
import { startInitialAnalysis, getRepositoriesOfUser } from '../controllers/analysisController.js';

const router = express.Router({ mergeParams: true });

router.route('/').post(startInitialAnalysis);
router.route('/user').get(getRepositoriesOfUser);

export default router;
