import express from 'express';
import {
	updateSettings,
	getSettings,
	addQualityGate,
	removeQualityGate,
	updateQualityGate,
	updateCategoryValues,
	updateThresholdValue,
	updateCoefficientValue
} from '../controllers/settingsController.js';

const router = express.Router();

router.route('/:repoID').get(getSettings).put(updateSettings);
router.route('/quality_gate/:repoID').post(addQualityGate).delete(removeQualityGate).put(updateQualityGate);
router.route('/metric_management/category/:repoID').put(updateCategoryValues);
router.route('/metric_management/threshold/:repoID').put(updateThresholdValue);
router.route('/metric_management/coefficient/:repoID').put(updateCoefficientValue);

export default router;
