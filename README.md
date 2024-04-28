# Replication Package
This package contains resources used in "Enhanced Code Reviews Using Pull Request Based Change Impact Analysis".

## Contents 
| Content  | Location |
| -------- | ---- |
| Source Code for call graph server | callgraph-server |
| Source Code for GitHub bot | github-bot |
| Source Code for web application | web-application |
| Outline of Focus Group Discussions | Focus Group Session Outline.pdf |
| Feature feedback survey questions | Feature Feedback Survey.pdf |
| Participant answers for feature feedback survey | Feature Feedback Survey Answers.xlsx |
| Post demo survey questions | Post Demo Survey.pdf |
| Participant answers for post demo survey | Post Demo Survey Answers.xlsx |
| Instructions to start the project | Below this table 🔽 |


## How to run the project

### Prerequirements
1. Download repo.
2. Create a mongoDB cluster in [MongoDB website](https://mongodb.com) and get the cluster url by following the instructions.
3. Download neo4j desktop application in [neo4j website](https://neo4j.com/download). After downloading the application, create a neo4j database with two following plugins added:
- Graph Data Science Library 2.3.2
- APOC 5.3.0 

### Run steps

Follow the steps in given order.

**For Call Graph Server**
1. Add the your neo4j configurations to `src/main/resources/application.properties`. There should be three properties named `NEO4J_URI`, `USERNAME`, and `PASSWORD`. These configuration information should match with the neo4j database that you opened in the previous step. An example configuration can be seen below:  
`
NEO4J_URI= "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "44e7d90c807a13a4817fb8c12ab0b6ce5af62741"
`
2. Download dependencies using `mvn clean install`
3. Run the server using `mvn spring-boot:run`

**For Website**
1. Access ChangeImpactDetector/frontend directory using `cd ChangeImpactDetector/frontend` in root repo.
2. Download dependencies using `npm install` command.
3. Access ChangeImpactDetector/backend directory using `cd ChangeImpactDetector/backend` in root repo.
4. Download dependencies using `npm install` command.
5. Add mongoDB URL to `.env` file using this format `MONGO_URI=<your_mongoDB_connection_link>`.
6. Run the application using `npm run dev`. You should see the web application in `localhost:3005`.

**For GitHub Bot**
1. Access ChangeImpactDetectorBot directory using `cd ChangeImpactDetectorBot` in root repo.
2. Download dependencies using `npm install` command.
3. Run the ChangeImpactDetectorBot using `npm start` command.
4. Go to `localhost:3000` in your browser
5. Select `Register GitHub App`. After click on this button without connection to any repository, close the bot application using `cmd + c`.
6. Now, you should see newly created `.env` file in root directory.
7. Add mongoDB URL to `.env` file using this format `MONGO_URI=<your_mongoDB_connection_link>`.
8. Again, run the bot using `npm start` command. 
9. Go to your GitHub account settings and click on `Developer Settings`.
10. In GitHub Apps section, select your bot and click on `Edit`.
11. Click on `Install App` button.
12. Select the repository you want to analyze in the opened tab and give permission to application.

After you add the repository, initial analysis will start automatically. Do not terminate the application. This can take a while depending on the selected project size.
Then, it will listen for the events that occurred in GitHub, as long as it is active. So, keep the program open to keep your analysis data recent.


