package com.callgraph.service;

import ch.uzh.ifi.seal.changedistiller.model.classifiers.ChangeType;
import com.callgraph.generation.MethodCallExtractor;
import com.callgraph.model.callgraph.CallGraph;
import com.callgraph.model.callgraph.CallGraphEdge;
import com.callgraph.model.callgraph.CallGraphInit;
import com.callgraph.model.callgraph.CallGraphNode;
import com.callgraph.utils.CallgraphUtils;
import com.callgraph.utils.CommandUtils;
import com.callgraph.utils.GeneralUtils;
import com.callgraph.model.pr.ChangedFileWithPath;
import com.callgraph.model.pr.ChangedFileWithSha;
import com.callgraph.model.pr.FileStatus;
import com.callgraph.model.pr.PullRequestChange;
import com.callgraph.repository.CallGraphRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CallGraphService {
    private CallGraphRepository callGraphRepository;

    @Autowired
    public CallGraphService(CallGraphRepository callGraphRepository) {
        this.callGraphRepository = callGraphRepository;
    }

    public String createSaveCallGraph(CallGraphInit callGraphInit) {
        String currentPath = System.getProperty("user.dir");
        String upperLevelPath = currentPath.substring(0, currentPath.lastIndexOf("\\"));

        boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("windows");
        String branchName = callGraphInit.getBranchName();
        String projectIdentifier = callGraphInit.getProjectIdentifier();
        String githubToken = callGraphInit.getGithubToken();


        String projectPath = upperLevelPath + "\\" + "change_impact_detector\\analyzed_repositories";
        String cloneCommand = "git clone https://" + githubToken + "@github.com/" + projectIdentifier + ".git " + projectIdentifier;

        File folder = new File(projectPath);

        try {
            // Check whether the folder structure already exists. If not create the folders
            if (!(folder.exists() && folder.isDirectory())) {
                boolean created = folder.mkdirs();
                if (created) {
                    // Clone the wanted repository
                    CommandUtils.runCommandInPath(cloneCommand, projectPath);
                } else {
                    System.out.println("Failed to create folder at location: " + projectPath);
                }
            } else {
                // Clone the wanted repository
                CommandUtils.runCommandInPath(cloneCommand, projectPath);
            }
        } catch (IOException | InterruptedException e ) {
            System.out.println(e.getMessage());
        }

        List<String> mavenFiles = GeneralUtils.getFilesBySuffixInPaths("pom.xml", projectPath + "/" + projectIdentifier, false);
        List<String> gradleFiles = GeneralUtils.getFilesBySuffixInPaths("build.gradle", projectPath + "/" + projectIdentifier, false);

        if (!mavenFiles.isEmpty()) {
            CallgraphUtils.downloadDependencyJars("maven", (ArrayList<String>) mavenFiles, projectPath);
        } else {
            CallgraphUtils.downloadDependencyJars("gradle", (ArrayList<String>) gradleFiles, projectPath);
        }

        String srcPath = projectPath + "\\" + projectIdentifier;

        // Pull the possibly made changes to the remote branch
        GeneralUtils.gitCheckoutAndPull(srcPath, branchName);

        // Create the callgraph
        MethodCallExtractor extractor = new MethodCallExtractor();
        try {
            CallGraph callGraph = extractor.getMethodCallRelation(true, srcPath, null);
            callGraphRepository.createCallGraph(callGraph, branchName, projectIdentifier);

            return srcPath;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return "";
        }
    }

    public boolean updateCallGraph(PullRequestChange pullRequestChange) {
        boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("windows");
        String srcPath = GeneralUtils.getProjectSrcPath(pullRequestChange.getProjectIdentifier());

        MethodCallExtractor extractor = new MethodCallExtractor();

        ArrayList<String> oldFilesPath = new ArrayList<>();
        ArrayList<String> newFilesPath = new ArrayList<>();

        for (ChangedFileWithPath changedFileWithPath: pullRequestChange.getChangedFilesWithPath()) {
            String filePath = changedFileWithPath.getFilePath();
            FileStatus status = changedFileWithPath.getStatus();
            if (status == FileStatus.ADDED) {
                newFilesPath.add(filePath);
            } else if (status == FileStatus.REMOVED) {
                oldFilesPath.add(filePath);
            } else if (status == FileStatus.MODIFIED) {
                newFilesPath.add(filePath);
                oldFilesPath.add(filePath);
            }
        }

        // Pull the possibly made changes to the remote branches
        GeneralUtils.gitCheckoutAndPull(srcPath, pullRequestChange.getDestinationBranchName());

        // Create mini-callgraph for the old versions of the changed files
        CommandUtils.runCommand(srcPath, "git checkout " + pullRequestChange.getDestinationBranchSha(), isWindows);
        CallGraph oldCallGraph = extractor.getMethodCallRelation(false, srcPath, oldFilesPath);

        // Create mini-callgraph for the new versions of the changed files
        CommandUtils.runCommand(srcPath, "git checkout " + pullRequestChange.getOriginBranchSha(), isWindows);
        CallGraph newCallGraph = extractor.getMethodCallRelation(false, srcPath, newFilesPath);

        // Compare the created mini-callgraphs and find added/removed function calls and declarations
        ArrayList<CallGraphNode> oldNodes = oldCallGraph.getNodeList();
        ArrayList<CallGraphEdge> oldEdges = oldCallGraph.getEdgeList();
        ArrayList<CallGraphNode> newNodes = newCallGraph.getNodeList();
        ArrayList<CallGraphEdge> newEdges = newCallGraph.getEdgeList();

        // Find the differences between two mini-callgraphs
        List<CallGraphNode> removedNodes = oldNodes.stream().filter(x -> !newNodes.contains(x)).distinct().collect(Collectors.toList());
        List<CallGraphNode> addedNodes = newNodes.stream().filter(x -> !oldNodes.contains(x)).distinct().collect(Collectors.toList());
        List<CallGraphEdge> removedEdges = oldEdges.stream().filter(x -> !newEdges.contains(x)).distinct().collect(Collectors.toList());
        List<CallGraphEdge> addedEdges = newEdges.stream().filter(x -> !oldEdges.contains(x)).distinct().collect(Collectors.toList());

        try {
            callGraphRepository.updateCallGraph(removedNodes, addedNodes, removedEdges, addedEdges, pullRequestChange.getProjectIdentifier(), pullRequestChange.getDestinationBranchName());

            // Possible dependency update
            ArrayList<String> dependencyFiles = (ArrayList<String>) newFilesPath.stream().filter(s -> s.contains("pom.xml") || s.contains("build.gradle")).collect(Collectors.toList());
            if (!dependencyFiles.isEmpty()) {
                String dependencyType;
                if (dependencyFiles.get(0).endsWith("pom.xml")) {
                    dependencyType = "maven";
                } else {
                    dependencyType = "gradle";
                }
                CallgraphUtils.downloadDependencyJars(dependencyType, dependencyFiles, srcPath);
            }

            return true;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    public HashMap<String, Object> getChangeImpact(PullRequestChange pullRequestChange) {
        boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("windows");
        String srcPath = GeneralUtils.getProjectSrcPath(pullRequestChange.getProjectIdentifier());
        String prNumber = pullRequestChange.getPrNumber();

        String folderPath = srcPath.substring(0, srcPath.lastIndexOf("\\")) + "\\" + pullRequestChange.getPrNumber();
        ArrayList<ChangedFileWithSha> changedFilesWithSha = pullRequestChange.getChangedFilesWithSha();

        // Pull the possibly made changes to the remote branches
        GeneralUtils.gitCheckoutAndPull(srcPath, pullRequestChange.getDestinationBranchName());

        // Calculate changeset of a pull request
        HashMap<String, ChangeType> changeMap = CallgraphUtils.calculateChangeSet(srcPath, prNumber, changedFilesWithSha);

        try {
            HashMap<String, Object> impact = callGraphRepository.calculateImpact(changeMap, pullRequestChange.getImpactLevel(), pullRequestChange.getDestinationBranchName(), pullRequestChange.getProjectIdentifier());
            return impact;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public Double calculatePRPageRank(PullRequestChange pullRequestChange) {
        boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("windows");
        String srcPath = GeneralUtils.getProjectSrcPath(pullRequestChange.getProjectIdentifier());
        String prNumber = pullRequestChange.getPrNumber();

        String folderPath = srcPath.substring(0, srcPath.lastIndexOf("\\")) + "\\" + pullRequestChange.getPrNumber();
        ArrayList<ChangedFileWithSha> changedFilesWithSha = pullRequestChange.getChangedFilesWithSha();

        // Pull the possibly made changes to the remote branches
        GeneralUtils.gitCheckoutAndPull(srcPath, pullRequestChange.getDestinationBranchName());

        // Calculate changeset of a pull request
        HashMap<String, ChangeType> changeMap = CallgraphUtils.calculateChangeSet(srcPath, prNumber, changedFilesWithSha);

        ArrayList<String> changedMethods = new ArrayList<>(changeMap.keySet());

        try {
            return callGraphRepository.calculateChangeSetPageRank(changedMethods, pullRequestChange.getDestinationBranchName(), pullRequestChange.getProjectIdentifier());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public String neo4jToImage(PullRequestChange pullRequestChange) {
        boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("windows");
        String srcPath = GeneralUtils.getProjectSrcPath(pullRequestChange.getProjectIdentifier());
        String prNumber = pullRequestChange.getPrNumber();

        String folderPath = srcPath.substring(0, srcPath.lastIndexOf("\\")) + "\\" + pullRequestChange.getPrNumber();
        ArrayList<ChangedFileWithSha> changedFilesWithSha = pullRequestChange.getChangedFilesWithSha();

        // Pull the possibly made changes to the remote branches
        GeneralUtils.gitCheckoutAndPull(srcPath, pullRequestChange.getDestinationBranchName());

        // Calculate changeset of a pull request
        HashMap<String, ChangeType> changeMap = CallgraphUtils.calculateChangeSet(srcPath, prNumber, changedFilesWithSha);

        try {
            return callGraphRepository.neo4jToImage(changeMap, pullRequestChange.getDestinationBranchName(), pullRequestChange.getProjectIdentifier(), pullRequestChange.getPrNumber());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

}
