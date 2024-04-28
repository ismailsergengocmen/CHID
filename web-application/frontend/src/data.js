export const branchInfo = {
	ownerName: 'Jane Doe',
	projectName: 'Backend',
	branchName: 'Main',
	riskScore: '25%',
	riskScoreCat: 'C',
	technicalDebt: '4d 5h',
	technicalDebtCat: 'A',
	codeCov: '55%',
	codeCovCat: 'B',
	isPassed: false,
	problemCategories: [1, 0, 0],
	reasons: ['< 15% Risk Score Required'],
};

export const pullRequestInfo = {
	riskScore: '55%',
	riskScoreCat: 'C',
	codeChurn: 10,
	coChangedFiles: 8,
	technicalDebt: '4d 5h',
	technicalDebtCat: 'A',
	codeCov: '55%',
	codeCovCat: 'B',
	prevBugFreq: 3,
	isPassed: false,
	problemCategories: [1, 0, 0, 0, 1, 0],
	reasons: [
		'< 15% Risk Score Required',
		0,
		0,
		0,
		'> 80% Code Coverage Required',
		0,
	],
};

export const repoInfo = {
	ownerName: 'Jane Doe',
	projectName: 'Backend',
	riskScoreAvg: '55%',
	riskScoreCat: 'C',
	codeChurnAvg: 10,
	coChangedFilesAvg: 8,
	technicalDebtAvg: '4d 5h',
	technicalDebtCat: 'A',
	codeCovAvg: '55%',
	codeCovCat: 'B',
	prevBugFreqAvg: 3,
	isPassed: false,
	problemCategories: [1, 0, 0, 0, 1, 0],
	reasons: [
		'< 15% Risk Score Required',
		0,
		0,
		0,
		'> 80% Code Coverage Required',
		0,
	],
};

export const pullRequestBasicInfo = {
	authorName: 'John Doe',
	type: 'Pull Request',
	projectName: 'Backend',
	branchName: 'Test',
	addedLineCount: 423,
	deletedLineCount: 68,
	changedFileCount: 5,
	pullRequestName: '16342 - Pull Request 9',
};

export const adminRepoInfos = [
	{
		projectName: 'Backend',
		authorName: 'Jane Doe',
		lastAnalysis: '11/7/2022, 2:20 PM',
		loc: '6.6k',
	},
	{
		projectName: 'Repository 2',
		authorName: 'Ahmed',
		lastAnalysis: '11/5/2022, 3:28 PM',
		loc: '1.3k',
	},
	{
		projectName: 'Repository 3',
		authorName: 'Ezgi',
		lastAnalysis: '11/5/2022, 10:42 PM',
		loc: '4k',
	},
];

export const feedback = [
	{
		authorName: 'Jane Doe',
		role: 'Team Lead',
		id: '2048295',
		comment:
			"I really found this project useful to see my pull requests' impact. It is pretty fast but I believe there is a problem in test coverage impact. Even I did not create tests in my pull requests, the ratio increases every time I merge a pull request. Also, I would like to be able to see and interact with my code on change impact detector.",
	},
	{
		authorName: 'Ahmed',
		role: 'Developer',
		id: '1920593',
		comment:
			'I did not like the impact graph future. There are some method that should not be in impact graph. Some futures are totally useless. Plus, why should I wait for impact graph construction, initially? I want to be able to use the program right after the setup.',
	},
];

export const feedback2 = [
	{
		authorName: 'Ezgi',
		role: 'Developer',
		id: '2235123',
		comment:
			'Me and my team, we like to use this tool. It really helps us to guide interns while they get used to GitHub and its pull request mechanism.',
	},
	{
		authorName: 'Lena',
		role: 'Developer',
		id: '1693205',
		comment:
			'It takes forever to finish the analysis. Please make them faster. I can finish implementing another project while this tool is trying to analyze a pull request.',
	},
];

export const projects = [
	{
		projectName: 'Backend',
		authorName: 'Jane Doe',
		lastAnalysis: '11/7/2022, 2:20 PM',
		loc: '6.6k',
		riskScore: 'High',
		analysis: '1h 48min',
		codeCoverage: '38.3%',
	},
];

const riskScoreChartInfo = {
	labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	datasets: [
		{
			label: 'Risk Score Average(%)',
			data: [20, 18, 22, 20, 23, 25],
			backgroundColor: '#eb4d4b',
			borderColor: 'grey',
			pointBackgroundColor: '#eb4d4b',
			tension: 0.4,
		},
	],
};

const bugFreqChartInfo = {
	labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	datasets: [
		{
			label: 'Bug Frequency Average(File)',
			data: [2, 4, 3, 4, 2, 4],
			backgroundColor: 'yellow',
			borderColor: 'grey',
			pointBackgroundColor: 'yellow',
			tension: 0.4,
		},
	],
};

const codeChurnChartInfo = {
	labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	datasets: [
		{
			label: 'Technical Debt Average(Hours)',
			data: [76, 90, 84, 80, 74, 78],
			backgroundColor: '#6ab04c',
			borderColor: 'grey',
			pointBackgroundColor: '#6ab04c',
			tension: 0.4,
		},
	],
};

const prSizeChartInfo = {
	labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	datasets: [
		{
			label: 'Code Coverage Average(%)',
			data: [78, 81, 85, 82, 78, 75],
			backgroundColor: '#22a6b3',
			borderColor: 'grey',
			pointBackgroundColor: '#22a6b3',
			tension: 0.4,
		},
	],
};