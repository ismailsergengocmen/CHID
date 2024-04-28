import asyncHandler from 'express-async-handler';
import Repository from '../models/Repository.js';
import axios from 'axios';

const getImpactGraph = asyncHandler(async (req, res) => {
	const repoID = req.params.repoID;
	const prNumber = req.params.prNumber;
	const impactLevel = req.query.impactLevel;

	const {
		analyzed_branches: result,
		source_code_location_path: srcPath,
		repo_owner,
		repo_name,
	} = await Repository.findOne({
		repo_id: repoID,
	}).lean();
	const pullRequest = result[0].pullRequests.find((pullRequest) => pullRequest.number == prNumber);

	const changedFilesWithSha = pullRequest.files.map((file) => {
		return {
			fileName: file.name,
			status: file.status.toUpperCase(),
			oldSha: file.destination_sha,
			newSha: file.origin_sha,
		};
	});

	const { data: impact } = await axios.post(`${process.env.CALLGRAPH_SERVER_URL}/api/v1/callgraph/impact`, {
		srcPath,
		prNumber,
		destinationBranchName: pullRequest.branch_name.destination,
		projectIdentifier: repo_owner + '/' + repo_name,
		impactLevel,
		changedFilesWithSha,
	});

	const nodes = impact.nodes;
	const edges = impact.edges;
	const fileNames = new Set();

	let updatedNodes = [];
	for (const key in nodes) {
		const val = nodes[key];

		fileNames.add(val.packageName + '.' + val.className);

		let nodeColor;
		if (val.deleted) {
			nodeColor = "#FF6961";
		} else if (val.changed && !val.affected) {
			nodeColor = "#FFA500";
		} else if (val.changed && val.affected){
			nodeColor = "#FFA500 #ADD8E6";
		} else if (!val.changed) {
			nodeColor = "#ADD8E6";
		}

		const object = {
			id: val.functionSignature,
			type: 'custom',
			position: { x: 0, y: 0 },
			data: {
				className: val.className,
				functionName: val.functionName,
				simplifiedSignature: val.simplifiedSignature,
				packageName: val.packageName,
				changed: val.changed,
				affected: val.affected,
				deleted: val.deleted,
				filePath: val.filePath,
				isTerminal: val.terminal,
				destinationBranchName: pullRequest.branch_name.destination,
				projectIdentifier: repo_owner + '/' + repo_name,
				nodeColor
			},
			hidden: false,
			primary: true,
		};
		updatedNodes.push(object);
	}

	let updatedEdges = [];
	for (const key in edges) {
		const object = {
			id: key,
			source: edges[key].startNodeSignature,
			target: edges[key].endNodeSignature,
			hidden: false,
			primary: true,
			label: edges[key].impactLevel,
			type: 'smart',
			style: { stroke: 'gray' },
		};
		updatedEdges.push(object);
	}

	res.json({
		updatedNodes,
		updatedEdges,
		fileNames: Array.from(fileNames),
	});
});

export { getImpactGraph };
