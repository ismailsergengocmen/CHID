import asyncHandler from 'express-async-handler';
import Repository from '../models/Repository.js';
import User from '../models/User.js';
import {Octokit} from "@octokit/rest";

/*
 * @desc    Start initial analysis
 * @route   POST api/analysis
 * @access  Private
 */
const startInitialAnalysis = asyncHandler(async (req, res) => {
  const username = req.user.user_login;
  const repo = req.body.repo;
  const repo_github_id = repo.id;
  const repo_owner = repo.owner;
  const repo_name = repo.name;
  const tags = req.body.tags;

  try {
    const personExist = await User.findOneAndUpdate(
      {user_login: username},
      {$push: {user_repo_ids: repo_github_id}}
    )
    
    if(personExist){
      const result = await Repository.findOneAndUpdate(
        {repo_id: repo_github_id}, 
        {$set: {repo_id: repo_github_id, project_tags: tags, repo_name: repo_name, repo_owner: repo_owner}},
        {new: true, upsert: true}
      )
      if(result){
        console.log("Repository " + repo + " successfully saved to user " + username)
        res.status(200).json({message: "Repository " + repo_name + " successfully saved to user " + username});
      }
    }
  } catch (error) {
    console.log(error)
    return false;
  }
});

/*
 * @desc    Fetch all repositories
 * @route   GET /api/analysis/user
 * @access  Private
 */
const getRepositoriesOfUser = asyncHandler(async (req, res) => {
	const user = req.user;

  //Take repository ids and names from github of current user
  const octokit = new Octokit({
    auth: user.user_gh_access_token
  });

  const {data} = await octokit.repos.listForAuthenticatedUser({
    affiliation: "collaborator, owner"
  });

  const repositories = data.map((repo) => {
    return {
      name: repo.name,
      id: repo.id,
      owner: repo.owner.login,
    }
  })

	res.json(repositories);
});

export { startInitialAnalysis, getRepositoriesOfUser };