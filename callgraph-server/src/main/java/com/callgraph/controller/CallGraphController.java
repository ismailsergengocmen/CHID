package com.callgraph.controller;

import com.callgraph.model.callgraph.CallGraphInit;
import com.callgraph.model.pr.*;
import com.callgraph.service.CallGraphService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("api/v1/callgraph")
public class CallGraphController {
    private CallGraphService callGraphService;

    @Autowired
    public CallGraphController(CallGraphService callGraphService) {
        this.callGraphService = callGraphService;
    }

    @PostMapping("create-save")
    public String createSaveCallGraph(@RequestBody CallGraphInit callGraphInit) {
        return callGraphService.createSaveCallGraph(callGraphInit);
    }

    @PostMapping("update")
    public boolean updateCallGraph(@RequestBody PullRequestChange pullRequestChange) {
        return callGraphService.updateCallGraph(pullRequestChange);
    }

    @PostMapping("impact")
    public HashMap<String, Object> getChangeImpact(@RequestBody PullRequestChange pullRequestChange) {
        return callGraphService.getChangeImpact(pullRequestChange);
    }

    @PostMapping("pagerank")
    public Double calculatePRPageRank(@RequestBody PullRequestChange pullRequestChange) {
        return callGraphService.calculatePRPageRank(pullRequestChange);
    }

    @PostMapping("impact_image")
    public String neo4jToImage(@RequestBody PullRequestChange pullRequestChange) {
        return callGraphService.neo4jToImage(pullRequestChange);
    }
}
