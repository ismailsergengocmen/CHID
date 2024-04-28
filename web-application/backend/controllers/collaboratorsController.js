import asyncHandler from 'express-async-handler';
import Repository from '../models/Repository.js';
import User from '../models/User.js';

/*
 * @desc    Fetch collaborators of a repository
 * @route   GET /api/collaborators/:repoID
 * @access  Private
 */
const fetchCollaborators = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;

	const collaborators = await Repository.findOne({ repo_id: repoID }, { collaborators: 1, _id: 0 });

	if (collaborators) {
		res.json(collaborators.collaborators);
	} else {
		res.status(404);
		throw new Error(`${location} settings not found`);
	}
});

/*
 * @desc    Remove a collaborator from a repository
 * @route   DELETE /api/collaborators/:repoID/:collaboratorID
 * @access  Private
 */
const removeCollaborator = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const collaboratorID = req.params.collaboratorID;

	const result = await Repository.updateOne(
		{ repo_id: repoID },
		{ $pull: { collaborators: { id: collaboratorID } } }
	);

	const userResult = await User.updateOne(
		{
			user_github_id: collaboratorID,
		},
		{
			$pull: { user_repo_ids: repoID },
		}
	);

	if (result.nModified === 0 && userResult.nModified === 0) {
		res.status(404);
		throw new Error(`Collaborator with ID ${collaboratorID} not found in repository with ID ${repoID}`);
	}

	res.json({ message: 'Collaborator deleted' });
});

/*
 * @desc    Change a collaborator role
 * @route   PUT /api/collaborators/:repoID/:collaboratorID
 * @access  Private
 */
const changeCollaboratorRole = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const collaboratorID = req.params.collaboratorID;
	const newRole = req.body.newRole;

	const result = await Repository.updateOne(
		{ repo_id: repoID, 'collaborators.id': collaboratorID },
		{ $set: { 'collaborators.$.role': newRole } }
	);

	if (result.nModified === 0) {
		res.status(404);
		throw new Error(`Collaborator with ID ${collaboratorID} not found in repository with ID ${repoID}`);
	}

	res.json({ message: 'Collaborator role updated' });
});

export { fetchCollaborators, removeCollaborator, changeCollaboratorRole };
