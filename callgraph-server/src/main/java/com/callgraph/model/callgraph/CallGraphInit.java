package com.callgraph.model.callgraph;

public class CallGraphInit {
    private String projectIdentifier;
    private String branchName;
    private String githubToken;

    public CallGraphInit() {
    }

    public CallGraphInit(String projectIdentifier, String branchName, String githubToken) {
        this.projectIdentifier = projectIdentifier;
        this.branchName = branchName;
        this.githubToken = githubToken;
    }

    public String getProjectIdentifier() {
        return projectIdentifier;
    }

    public void setProjectIdentifier(String projectIdentifier) {
        this.projectIdentifier = projectIdentifier;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getGithubToken() {
        return githubToken;
    }

    public void setGithubToken(String githubToken) {
        this.githubToken = githubToken;
    }
}
