package com.callgraph.repository;

import ch.uzh.ifi.seal.changedistiller.model.classifiers.ChangeType;
import com.callgraph.model.callgraph.CallGraph;
import com.callgraph.model.callgraph.CallGraphEdge;
import com.callgraph.model.callgraph.CallGraphNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public interface CallGraphRepository {
    void createCallGraph(CallGraph callGraph, String branchName, String projectIdentifier);
    void updateCallGraph(List<CallGraphNode> removedNodes, List<CallGraphNode> addedNodes,
                         List<CallGraphEdge> removedEdges, List<CallGraphEdge> addedEdges,
                         String projectIdentifier, String destinationBranchName);
    HashMap<String, Object> calculateImpact(HashMap<String, ChangeType> changeMap, Integer impactLevel, String branchName, String projectIdentifier);
    Double calculateChangeSetPageRank(ArrayList<String> changedMethods, String branchName, String projectIdentifier);
    void calculatePageRank();
    String neo4jToImage(HashMap<String, ChangeType> changeMap, String branchName, String projectIdentifier, String prNumber);
}
