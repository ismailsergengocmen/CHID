import asyncHandler from 'express-async-handler';
import Repository from '../models/Repository.js';

/*
 * @desc    Fetch all pull requests
 * @route   GET /api/repositories/:repoID/pullRequests
 * @access  Private
 */
const getPullRequests = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	
	const result = await Repository.find({repo_id: repoID}, "analyzed_branches").lean();
	const prs = result[0].analyzed_branches[0].pullRequests;
	
	//sort pullRequests
	prs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
	const pullRequests = prs.reverse();

	if(pullRequests){
		res.json(pullRequests);
	} else {
		res.status(404);
		throw new Error('Pull Requests not found');
	}
});

/*
 * @desc    Fetch certain pull request with a prNumber (number, not objectID)
 * @route   GET /api/repositories/:repoID/pullRequests/:prNumber
 * @access  Private
 */
const getPullRequestByNumber = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const prNumber = parseInt(req.params.prNumber);

	const result = await Repository.find({repo_id: repoID}, "analyzed_branches").lean();
	const pullRequest = result[0].analyzed_branches[0].pullRequests.find(pullRequest => pullRequest.number === prNumber);

	if (pullRequest) {
		res.json(pullRequest);
	} else {
		res.status(404);
		throw new Error('Pull Request not found');
	}
});

export { getPullRequests, getPullRequestByNumber };
