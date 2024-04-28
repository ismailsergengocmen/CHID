import express from 'express';
import { getImpactGraph } from '../controllers/impactController.js';

const router = express.Router({ mergeParams: true });

router.route('/').get(getImpactGraph);

export default router;
