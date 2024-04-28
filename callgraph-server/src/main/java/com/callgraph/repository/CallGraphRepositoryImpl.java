package com.callgraph.repository;

import ch.uzh.ifi.seal.changedistiller.model.classifiers.ChangeType;
import com.callgraph.model.callgraph.CallGraph;
import com.callgraph.model.callgraph.CallGraphEdge;
import com.callgraph.model.callgraph.CallGraphNode;
import com.callgraph.utils.GeneralUtils;
import com.callgraph.model.pr.ImpactEdge;
import com.callgraph.model.pr.ImpactNode;
import guru.nidi.graphviz.model.MutableGraph;
import org.neo4j.driver.*;
import org.neo4j.driver.exceptions.Neo4jException;
import org.neo4j.driver.types.Node;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Map;

import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static org.neo4j.driver.Values.parameters;

import guru.nidi.graphviz.engine.Format;
import guru.nidi.graphviz.engine.Graphviz;
import guru.nidi.graphviz.parse.Parser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import javax.annotation.PreDestroy;

@Repository
public class CallGraphRepositoryImpl implements AutoCloseable, CallGraphRepository {
    private static final Logger LOGGER = Logger.getLogger(CallGraphRepositoryImpl.class.getName());
    private final Driver driver;

    private final static String KEY_PATH = "src/main/resources/firebase-adminsdk.json";

    @Value("${firebase.projectId}")
    private String projectId;

    public CallGraphRepositoryImpl(@Value("${neo4j.uri}") String uri,
                                   @Value("${neo4j.username}") String username,
                                   @Value("${neo4j.password}") String password) {
        this.driver = GraphDatabase.driver(uri, AuthTokens.basic(username, password), Config.defaultConfig());
    }

    @PreDestroy
    public void close() {
        driver.close();
    }

    public void createCallGraph(CallGraph callGraph, String branchName, String projectIdentifier) {
        ArrayList<CallGraphNode> nodes = callGraph.getNodeList();
        ArrayList<CallGraphEdge> edges = callGraph.getEdgeList();

        List<Map<String, Object>> mapOfNodes = nodes.stream().map(CallGraphNode::toMap).collect(Collectors.toList());
        List<Map<String, Object>> mapOfEdges = edges.stream().map(CallGraphEdge::toMap).collect(Collectors.toList());

        Query nodeQuery = new Query("UNWIND $nodes AS nodes \n"
                                  + "CREATE (f:Function) SET f = nodes, f.branchName = $branchName, \n"
                                  + "f.projectIdentifier = $projectIdentifier ",
                                  parameters("nodes", mapOfNodes, "branchName", branchName, "projectIdentifier", projectIdentifier));

        try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
            session.writeTransaction(tx -> tx.run(nodeQuery));
        } catch (Neo4jException ex) {
            LOGGER.log(Level.SEVERE, nodeQuery + " raised an exception", ex);
            throw ex;
        }

        Query edgeQuery = new Query("UNWIND $edges AS edges \n"
                                    + "MATCH (a:Function { signature: edges.startNodeSignature, branchName: $branchName, projectIdentifier: $projectIdentifier }), (b:Function { signature: edges.endNodeSignature, branchName: $branchName, projectIdentifier: $projectIdentifier }) \n"
                                    + "CREATE (a)-[:CALLS]->(b) \n",
                                      parameters("edges", mapOfEdges, "branchName", branchName, "projectIdentifier", projectIdentifier));

        try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
            session.writeTransaction(tx -> tx.run(edgeQuery));
        } catch (Neo4jException ex) {
            LOGGER.log(Level.SEVERE, edgeQuery + " raised an exception", ex);
            throw ex;
        }

        calculatePageRank();
    }

    public void updateCallGraph(List<CallGraphNode> removedNodes,
                                List<CallGraphNode> addedNodes,
                                List<CallGraphEdge> removedEdges,
                                List<CallGraphEdge> addedEdges,
                                String projectIdentifier,
                                String destinationBranchName) {

        if (!removedNodes.isEmpty()) {
            List<String> removedNodeSig = removedNodes.stream().map(CallGraphNode::getFunctionSignature).collect(Collectors.toList());

            Query query = new Query("MATCH (f:Function) WHERE f.projectIdentifier = $projectIdentifier AND f.branchName = $branchName AND f.signature IN $removedNodeSig \n"
                                    + "WITH COLLECT(f) AS nodes \n"
                                    + "FOREACH (node IN nodes | DETACH DELETE node)",
                                    parameters("projectIdentifier", projectIdentifier, "branchName", destinationBranchName, "removedNodeSig", removedNodeSig));

            try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
                session.writeTransaction(tx -> tx.run(query));
            } catch (Neo4jException ex) {
                LOGGER.log(Level.SEVERE, query + " raised an exception", ex);
                throw ex;
            }
        }

        if (!addedNodes.isEmpty()) {
            List<Map<String, Object>> mapOfNodes = addedNodes.stream().map(CallGraphNode::toMap).collect(Collectors.toList());

            Query query = new Query("UNWIND $nodes AS nodes \n"
                                    + "MERGE (f:Function {functionId: nodes.functionId}) \n"
                                    + "ON CREATE SET f = nodes, f.branchName = $branchName, f.projectIdentifier = $projectIdentifier",
                                    parameters("nodes", mapOfNodes, "branchName", destinationBranchName, "projectIdentifier", projectIdentifier));

            try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
                session.writeTransaction(tx -> tx.run(query));
            } catch (Neo4jException ex) {
                LOGGER.log(Level.SEVERE, query + " raised an exception", ex);
                throw ex;
            }
        }

        if (!removedEdges.isEmpty()) {
            List<Map<String, Object>> mapOfEdges = removedEdges.stream().map(CallGraphEdge::toMap).collect(Collectors.toList());

            Query query = new Query("UNWIND $edges AS edges \n"
                                    + "MATCH (startNode:Function)-[r:CALLS]->(endNode:Function) \n"
                                    + "WHERE startNode.signature = edges.startNodeSignature AND endNode.signature = edges.endNodeSignature \n"
                                    + "AND startNode.branchName = $branchName AND startNode.projectIdentifier = $projectIdentifier \n"
                                    + "AND endNode.branchName = $branchName AND endNode.projectIdentifier = $projectIdentifier \n"
                                    + "DELETE r", parameters("edges", mapOfEdges, "branchName", destinationBranchName, "projectIdentifier", projectIdentifier));

            try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
                session.writeTransaction(tx -> tx.run(query));
            } catch (Neo4jException ex) {
                LOGGER.log(Level.SEVERE, query + " raised an exception", ex);
                throw ex;
            }
        }

        if (!addedEdges.isEmpty()) {
            List<Map<String, Object>> mapOfEdges = addedEdges.stream().map(CallGraphEdge::toMap).collect(Collectors.toList());

            Query query = new Query("UNWIND $edges AS edges \n"
                                    + "MATCH (a:Function { signature: edges.startNodeSignature, branchName: $branchName, projectIdentifier: $projectIdentifier }), (b:Function { signature: edges.endNodeSignature, branchName: $branchName, projectIdentifier: $projectIdentifier }) \n"
                                    + "MERGE (a)-[:CALLS]->(b) \n",
                                    parameters("edges", mapOfEdges, "branchName", destinationBranchName, "projectIdentifier", projectIdentifier));

            try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
                session.writeTransaction(tx -> tx.run(query));
            } catch (Neo4jException ex) {
                LOGGER.log(Level.SEVERE, query + " raised an exception", ex);
                throw ex;
            }
        }

        calculatePageRank();
    }

    public HashMap<String, Object> calculateImpact(HashMap<String, ChangeType> changeMap, Integer impactLevel, String branchName, String projectIdentifier) {
        ArrayList<String> changedMethods = new ArrayList<>(changeMap.keySet());
        String queryString = "MATCH (neighbours:Function)-[r:CALLS*1.." + impactLevel + "]->(changedFunction:Function) \n"
                            + "WHERE changedFunction.branchName = $branchName AND changedFunction.projectIdentifier = $projectIdentifier \n"
                            + "AND neighbours.branchName = $branchName AND neighbours.projectIdentifier = $projectIdentifier \n"
                            + "AND changedFunction.signature IN $changedMethods \n"
                            + "WITH changedFunction, neighbours, r \n"
                            + "UNWIND r AS rel \n"
                            + "OPTIONAL MATCH (n_neighbours:Function)-[:CALLS]->(neighbours) "
                            + "RETURN COLLECT(changedFunction) AS changedFunctions, COLLECT(neighbours) AS neighbours, COLLECT(n_neighbours IS NULL) AS terminated, "
                            + "COLLECT(startNode(rel).signature) AS startSignatures, COLLECT(endNode(rel).signature) AS endSignatures";

        Query query = new Query(queryString, parameters("branchName", branchName, "projectIdentifier", projectIdentifier, "changedMethods", changedMethods));

        try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
            Record record = session.readTransaction(tx -> tx.run(query).single());
            HashSet<ImpactNode> nodes = new HashSet<>();
            HashSet<ImpactEdge> edges = new HashSet<>();

            List<Object> changedFunctions = record.get("changedFunctions").asList();
            List<Object> neighbours = record.get("neighbours").asList();
            List<Object> terminated = record.get("terminated").asList();
            List<Object> startSignatures = record.get("startSignatures").asList();
            List<Object> endSignatures = record.get("endSignatures").asList();

            for (Object changedFunction: changedFunctions) {
                Node cf = (Node)changedFunction;
                boolean isChanged = changeMap.containsKey(cf.get("signature").asString());
                boolean isDeleted = isChanged && changeMap.get(cf.get("signature").asString()).toString().equals("REMOVED_FUNCTIONALITY");

                ImpactNode iNode = new ImpactNode(cf.get("className").asString(),
                                                  cf.get("functionName").asString(),
                                                  cf.get("packageName").asString(),
                                                  cf.get("signature").asString(),
                                                  cf.get("filePath").asString(),
                                                  isChanged, isDeleted, false, false);
                nodes.add(iNode);
            }

            for (int i = 0; i < neighbours.size(); i++) {
                Node neighbour = (Node)neighbours.get(i);

                boolean isChanged = changeMap.containsKey(neighbour.get("signature").asString());
                boolean isDeleted = isChanged && changeMap.get(neighbour.get("signature").asString()).toString().equals("REMOVED_FUNCTIONALITY");
                boolean isTerminal = (boolean) terminated.get(i);

                ImpactNode iNode = new ImpactNode(neighbour.get("className").asString(),
                                                  neighbour.get("functionName").asString(),
                                                  neighbour.get("packageName").asString(),
                                                  neighbour.get("signature").asString(),
                                                  neighbour.get("filePath").asString(),
                                                  isChanged, isDeleted, true, isTerminal);

                boolean success = nodes.add(iNode);
                if (!success) {
                    ImpactNode duplicateNode = nodes.stream().filter(n -> n.getFunctionSignature().equals(iNode.getFunctionSignature())).findFirst().get();
                    duplicateNode.setAffected(true);
                }
            }

            for (int i = 0; i < startSignatures.size(); i++) {
                String start = (String) startSignatures.get(i);
                String end = (String) endSignatures.get(i);
                Integer impactSignificance = changeMap.containsKey(start) ? changeMap.get(start).getSignificance().value() : 0;

                ImpactEdge edge = new ImpactEdge(end, start, impactSignificance);
                edges.add(edge);
            }

            HashMap<String, Object> impact = new HashMap<>();
            impact.put("nodes", nodes);
            impact.put("edges", edges);
            return impact;
        } catch (Neo4jException ex) {
            LOGGER.log(Level.SEVERE, query + " raised an exception", ex);
            throw ex;
        }
    }

    public Double calculateChangeSetPageRank(ArrayList<String> changedMethods, String branchName, String projectIdentifier) {
        String queryString = "MATCH (n: Function) \n" +
                             "WHERE n.projectIdentifier = $projectIdentifier AND n.branchName = $branchName AND n.signature IN $changedMethods \n" +
                             "RETURN sum(n.pagerank) AS totalPageRank";

        Query query = new Query(queryString, parameters("projectIdentifier", projectIdentifier, "branchName", branchName, "changedMethods", changedMethods));
        try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
            Record record = session.readTransaction(tx -> tx.run(query).single());
            return record.get("totalPageRank").asDouble();
        } catch (Neo4jException ex) {
            LOGGER.log(Level.SEVERE, query + " raised an exception", ex);
            throw ex;
        }
    }

    public void calculatePageRank() {
        final int MAX_ITERATION = 20;
        final double DAMPING_FACTOR = 0.85;

        String memoryQueryString =
                "CALL gds.graph.exists('pagerankgraph')\n" +
                "YIELD exists\n" +
                "WITH exists\n" +
                "CALL apoc.do.when(exists, \"CALL gds.graph.drop('pagerankgraph') YIELD graphName RETURN graphName\", \n" +
                "\"RETURN null AS graphName\",\n" +
                "{}\n" +
                ") YIELD value \n" +
                "CALL gds.graph.project.cypher(\n" +
                "    'pagerankgraph', \n" +
                "    'MATCH (n:Function) WHERE EXISTS((n)--()) RETURN id(n) AS id',\n" +
                "    'MATCH (n:Function)-[r:CALLS]->(m:Function) RETURN id(n) AS source, id(m) AS target'\n" +
                ")\n" +
                "YIELD graphName \n" +
                "RETURN graphName";

        String pageRankQueryString = "CALL gds.pageRank.write('pagerankgraph', \n" +
                                     "{ maxIterations: $maxIteration, dampingFactor: $dampingFactor, writeProperty: 'pagerank', scaler: 'L1Norm' })";

        Query memoryQuery = new Query(memoryQueryString);
        Query pageRankQuery = new Query(pageRankQueryString, parameters("maxIteration", MAX_ITERATION, "dampingFactor", DAMPING_FACTOR));

        try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
            session.writeTransaction(tx -> tx.run(memoryQuery));
            session.writeTransaction(tx -> tx.run(pageRankQuery));
        } catch (Neo4jException ex) {
            LOGGER.log(Level.SEVERE, "There was an exception", ex);
            throw ex;
        }
    }

    public String neo4jToImage(HashMap<String, ChangeType> changeMap, String branchName, String projectIdentifier, String prNumber) {
        ArrayList<String> changedMethods = new ArrayList<>(changeMap.keySet());
        String queryString = "MATCH (neighbours:Function)-[r:CALLS*1..3]->(changedFunction:Function) \n"
                + "WHERE changedFunction.branchName = $branchName AND changedFunction.projectIdentifier = $projectIdentifier \n"
                + "AND neighbours.branchName = $branchName AND neighbours.projectIdentifier = $projectIdentifier \n"
                + "AND changedFunction.signature IN $changedMethods \n"
                + "WITH changedFunction, neighbours, r \n"
                + "UNWIND r AS rel \n"
                + "RETURN COLLECT(changedFunction) AS changedFunctions, COLLECT(neighbours) AS neighbours, "
                + "COLLECT(startNode(rel).signature) AS startSignatures, COLLECT(endNode(rel).signature) AS endSignatures";

        Query query = new Query(queryString, parameters("branchName", branchName, "projectIdentifier", projectIdentifier, "changedMethods", changedMethods));

        try (Session session = driver.session(SessionConfig.forDatabase("neo4j"))) {
            Record record = session.readTransaction(tx -> tx.run(query).single());
            HashSet<ImpactEdge> edges = new HashSet<>();

            List<Object> changedFunctions = record.get("changedFunctions").asList();
            List<Object> neighbours = record.get("neighbours").asList();
            List<Object> startSignatures = record.get("startSignatures").asList();
            List<Object> endSignatures = record.get("endSignatures").asList();

            StringBuilder dotFileContent = new StringBuilder();
            dotFileContent.append("digraph G {\n");
            dotFileContent.append("  node [shape=box, fontname=Arial, fontsize=10, style=\"rounded,filled\", fillcolor=\"#D8D8D8\", height=0.6, width=1.8];\n");
            dotFileContent.append("  edge [fontname=Arial, fontsize=10];\n");

            for (Object changedFunction: changedFunctions) {
                Node cf = (Node)changedFunction;
                boolean isChanged = changeMap.containsKey(cf.get("signature").asString());
                boolean isDeleted = isChanged && changeMap.get(cf.get("signature").asString()).toString().equals("REMOVED_FUNCTIONALITY");

                String nodeColor = isDeleted ? "#FF6961" : "#FFA500"; // Red or orange

                // Add the nodes and edges to the DOT file
                dotFileContent.append(String.format("  \"%s\" [\n", cf.get("signature").asString()));
                dotFileContent.append("    shape=none,\n");
                dotFileContent.append("    label=<<table border=\"0\" cellborder=\"0\" cellspacing=\"0\" cellpadding=\"1\">\n");
                dotFileContent.append(String.format("      <tr><td align=\"center\"><font point-size=\"10\"><b>%s</b></font></td></tr>\n", cf.get("className").asString()));
                dotFileContent.append(String.format("      <tr><td align=\"center\"><font point-size=\"8\">%s</font></td></tr>\n", cf.get("functionName").asString()));
                dotFileContent.append("    </table>>\n");
                dotFileContent.append("    fillcolor= \"").append(nodeColor).append("\"");
                dotFileContent.append("  ];\n");
            }

            for (Object n : neighbours) {
                Node neighbour = (Node) n;
                boolean isChanged = changeMap.containsKey(neighbour.get("signature").asString());
                boolean isDeleted = isChanged && changeMap.get(neighbour.get("signature").asString()).toString().equals("REMOVED_FUNCTIONALITY");

                String nodeColor = isDeleted ? "#FF6961" : isChanged ? "#FFA500:#ADD8E6" : "#ADD8E6"; // red or orange-lightblue or lightblue

                // Add the nodes and edges to the DOT file
                dotFileContent.append(String.format("  \"%s\" [\n", neighbour.get("signature").asString()));
                dotFileContent.append("    shape=none,\n");
                dotFileContent.append("    label=<<table border=\"0\" cellborder=\"0\" cellspacing=\"0\" cellpadding=\"1\">\n");
                dotFileContent.append(String.format("      <tr><td align=\"center\"><font point-size=\"10\"><b>%s</b></font></td></tr>\n", neighbour.get("className").asString()));
                dotFileContent.append(String.format("      <tr><td align=\"center\"><font point-size=\"8\">%s</font></td></tr>\n", neighbour.get("functionName").asString()));
                dotFileContent.append("    </table>>\n");
                dotFileContent.append("    fillcolor= \"").append(nodeColor).append("\""); // This is both affected and changed function
                dotFileContent.append("  ];\n");
            }

            for (int i = 0; i < startSignatures.size(); i++) {
                String start = (String) startSignatures.get(i);
                String end = (String) endSignatures.get(i);
                ImpactEdge edge = new ImpactEdge(start, end, 3);

                boolean success = edges.add(edge);

                if (success) {
                    dotFileContent.append(String.format("  \"%s\"", end)).append(" -> ").append(String.format("  \"%s\"", start)).append("\n");
                }
            }
            dotFileContent.append("}\n");

            String objectName = projectIdentifier.replace("/", "_") + "_pr_" + prNumber;
            String filePath = "../" + objectName;

            try {
                File inputFile = new File(filePath + ".dot");
                BufferedWriter writer = new BufferedWriter(new FileWriter(inputFile));
                writer.write(dotFileContent.toString());
                writer.close();
                System.out.println("Successfully wrote text to file.");

                File outputFile = new File(filePath + ".svg");

                // Parse the input file
                MutableGraph graph = Parser.read(inputFile);

                // Use Graphviz to generate the PNG image
                Graphviz.fromGraph(graph).width(1000).render(Format.SVG).toFile(outputFile);

            } catch (IOException e) {
                System.out.println("An error occurred: " + e.getMessage());
            }

            String bucketName = projectId + ".appspot.com";
            return GeneralUtils.uploadFileToFirebaseStorage(KEY_PATH, projectId, bucketName, objectName, filePath + ".svg");
        } catch (Neo4jException ex) {
            LOGGER.log(Level.SEVERE, query + " raised an exception", ex);
            return null;
        }

    }
}