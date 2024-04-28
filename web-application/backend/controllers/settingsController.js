import asyncHandler from 'express-async-handler';
import Repository from '../models/Repository.js';

/*
 * @desc    Update a certain setting
 * @route   PUT /api/settings/:repoID?part=
 * @access  Private
 */
const updateSettings = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const settingsData = req.body;
	const location = req.query.part;

	const newObject = {
		[`settings.${location}`]: settingsData,
	};

	await Repository.updateOne({ repo_id: repoID }, { $set: newObject }).catch((err) => {
		res.status(400);
		throw new Error(`Problem when updating settings. Error: ${err}`);
	});

	res.send('Update successful');
});

/*
 * @desc    Get certain setting
 * @route   GET /api/settings/:repoID?part=
 * @access  Private
 */
const getSettings = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const location = req.query.part;

	const settings = await Repository.findOne({ repo_id: repoID }, `settings.${location}`);

	if (settings) {
		res.json(settings.settings[location]);
	} else {
		res.status(404);
		throw new Error(`${location} settings not found`);
	}
});

/*
 * @desc    Add new quality gate condition
 * @route   POST /api/settings/quality_gate/:repoID
 * @access  Private
 */
const addQualityGate = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const newQualityGate = req.body;

	await Repository.findOneAndUpdate(
		{ repo_id: repoID },
		{ $push: { 'settings.quality_gate': newQualityGate } }
	).catch((err) => {
		res.status(400);
		throw new Error(`Problem when adding quality gate. Error: ${err}`);
	});

	res.send('Update successful');
});

/*
 * @desc    Remove a quality gate condition
 * @route   DELETE /api/settings/quality_gate/:repoID
 * @access  Private
 */
const removeQualityGate = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const qualityGateInfo = req.body;

	await Repository.updateOne({ repo_id: repoID }, { $pull: { 'settings.quality_gate': qualityGateInfo } }).catch(
		(err) => {
			res.status(400);
			throw new Error(`Problem when removing quality gate. Error: ${err}`);
		}
	);

	res.send('Update successful');
});

/*
 * @desc    Update a quality gate condition
 * @route   PUT /api/settings/quality_gate/:repoID
 * @access  Private
 */
const updateQualityGate = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const oldQualityGate = req.body.old;
	const newQualityGate = req.body.new;

	await Repository.findOneAndUpdate(
		{
			repo_id: repoID,
			'settings.quality_gate.metric_name': oldQualityGate.metric_name,
			'settings.quality_gate.threshold': oldQualityGate.threshold,
		},
		{
			$set: {
				'settings.quality_gate.$.metric_name': newQualityGate.metric_name,
				'settings.quality_gate.$.threshold': newQualityGate.threshold,
			},
		}
	).catch((err) => {
		res.status(400);
		throw new Error(`Problem when updating settings. Error: ${err}`);
	});

	res.send('Update successful');
});

/*
 * @desc    Update a metric category values
 * @route   PUT /api/settings/metric_management/category/:repoID?metric=
 * @access  Private
 */
const updateCategoryValues = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const newCategories = req.body;
	const metricName = req.query.metric;

	let updateObj = {};
	for (const [key, value] of Object.entries(newCategories)) {
		updateObj[`settings.metric_management.${metricName}.${key}`] = value;
	}

	await Repository.updateOne({ repo_id: repoID }, { $set: updateObj }).catch((err) => {
		res.status(400);
		throw new Error(`Problem when updating settings. Error: ${err}`);
	});

	res.send('Update successful');
});

/*
 * @desc    Update a metric threshold value
 * @route   PUT /api/settings/metric_management/threshold/:repoID?metric=
 * @access  Private
 */
const updateThresholdValue = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const newValue = req.body.newValue;
	const metricName = req.query.metric;

	let updateObj = {};
	updateObj[`settings.metric_management.${metricName}.file_threshold`] = Number(newValue);

	await Repository.updateOne({ repo_id: repoID }, { $set: updateObj }).catch((err) => {
		res.status(400);
		throw new Error(`Problem when updating settings. Error: ${err}`);
	});

	res.send('Update successful');
});

/*
 * @desc    Update a riskscore metric coefficient value
 * @route   PUT /api/settings/metric_management/coefficient/:repoID?metric=
 * @access  Private
 */
const updateCoefficientValue = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const newValue = req.body.newValue;
	const metricName = req.query.metric;

	let updateObj = {};
	updateObj[`settings.metric_management.risk_score.formula.${metricName}`] = Number(newValue);

	await Repository.updateOne({ repo_id: repoID }, { $set: updateObj }).catch((err) => {
		res.status(400);
		throw new Error(`Problem when updating settings. Error: ${err}`);
	});

	res.send('Update successful');
});

export {
	updateSettings,
	getSettings,
	addQualityGate,
	removeQualityGate,
	updateQualityGate,
	updateCategoryValues,
	updateThresholdValue,
	updateCoefficientValue
};
