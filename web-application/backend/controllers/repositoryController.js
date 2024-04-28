import asyncHandler from 'express-async-handler';
import Repository from '../models/Repository.js';
import User from '../models/User.js';

/*
 * @desc    Fetch all repositories
 * @route   GET /api/repositories
 * @access  Private
 */
const getRepositories = asyncHandler(async (req, res) => {
	const repositories = await Repository.find({});
	res.json(repositories);
});

/*
 * @desc    Fetch certain repository
 * @route   GET /api/repositories/:id
 * @access  Private
 */
const getRepositoryById = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const repository = await Repository.findOne({ repo_id: repoID });

	if (repository) {
		res.json(repository);
	} else {
		res.status(404);
		throw new Error('Repository not found');
	}
});

/*
 * @desc    Fetch certain repository's overview info such as languages
 * @route   GET /api/repositories/:id/overview/languages
 * @access  Private
 */
const getOverview = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;

	const result = await Repository.findOne({ repo_id: repoID }, "overview");
	const overview = result.overview;

	if(overview){
		res.json(overview);
	} else {
		res.status(404);
		throw new Error("Overview not found")
	}
})

/*
 * @desc    Get general information of a repository
 * @route   GET /api/repositories/:id/generalInformation
 * @access  Private
 */
const getGeneralInformation = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const repository = await Repository.findOne({ repo_id: repoID });

	if (repository) {
		const generalInformation = {
			name: repository.repo_name,
			owner: repository.owner,
			url: repository.repo_url
		}
		res.json(generalInformation);
	} else {
		res.status(404);
		throw new Error("Overview not found")
	}
})

/*
 * @desc    Delete repository from database and analysis
 * @route   DELETE /api/repositories/:id/
 * @access  Private
 */
const deleteRepositoryFromAnalysis = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const info = await Repository.deleteOne({ repo_id: repoID });

	if(info.deletedCount === 1){
		try { 
			const result = await User.updateMany({ user_repo_ids: { $in: [repoID] } }, { $pull: { user_repo_ids: repoID }})
			console.log(`${result.modifiedCount} users updated`);
  	} catch (error) {
    console.error(error);
  	};
		res.status(200).json({message: "Repository deleted from analysis"})
	} else {
		res.status(404);
		throw new Error("A problem occured during deletion")
	}
})

/*
 * @desc    Get repositories that user can access
 * @route   GET /api/repositories/user
 * @access  Private
 */
const getRepositoriesThatUserCanAccess = asyncHandler(async (req, res) => {
	const user = req.user;
	const repositoryIDsUserCanAccess = user.user_repo_ids;
	const repositoryInfos = await Repository.find({repo_id: {$in: repositoryIDsUserCanAccess}}, {repo_name: 1, repo_owner: 1, repo_url: 1, repo_id: 1, project_tags: 1, is_initial_analyze_finished: 1, is_initial_call_graph_built: 1});
	
	if (repositoryInfos) {
		const repositories = repositoryInfos.map((repo) => {
			return {
				name: repo.repo_name,
				owner: repo.repo_owner,
				url: repo.repo_url,
				id: repo.repo_id,
				tags: repo.project_tags,
				is_initial_analyze_finished: repo.is_initial_analyze_finished,
				is_initial_call_graph_built: repo.is_initial_call_graph_built,
			}
		})
		res.json(repositories);
	} else {
		res.status(404);
		throw new Error('User does not have access to any repository');
	}
});

export { getRepositories, getRepositoryById, getOverview, getGeneralInformation, deleteRepositoryFromAnalysis, getRepositoriesThatUserCanAccess };
