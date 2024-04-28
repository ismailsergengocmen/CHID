import express from 'express';
import {
	getPullRequests,
	getPullRequestByNumber
} from '../controllers/pullRequestController.js';

const router = express.Router({ mergeParams: true });

router.route('/').get(getPullRequests);
router.route('/:prNumber').get(getPullRequestByNumber);

export default router;
