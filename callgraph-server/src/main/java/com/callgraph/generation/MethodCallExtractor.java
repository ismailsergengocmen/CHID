package com.callgraph.generation;

import com.callgraph.model.callgraph.CallGraph;
import com.callgraph.model.callgraph.CallGraphEdge;
import com.callgraph.model.callgraph.CallGraphNode;
import com.callgraph.utils.GeneralUtils;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import com.github.javaparser.resolution.declarations.ResolvedMethodDeclaration;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.javaparsermodel.declarations.JavaParserMethodDeclaration;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.*;

public class MethodCallExtractor {
    public MethodCallExtractor() {}

    public CallGraph getMethodCallRelation(boolean isRoot, String rootPath, List<String> filePaths) {
        JavaSymbolSolver symbolSolver = SymbolSolverFactory.getJavaSymbolSolver(rootPath);
        StaticJavaParser.getParserConfiguration().setSymbolResolver(symbolSolver);
        StaticJavaParser.getParserConfiguration().setLanguageLevel(ParserConfiguration.LanguageLevel.JAVA_17);
        StaticJavaParser.getParserConfiguration().setPreprocessUnicodeEscapes(true);

        HashMap<String, CallGraphNode> nodes = new HashMap<>();
        ArrayList<CallGraphEdge> edges = new ArrayList<>();

        // If it is root, create a callgraph starting from rootPath. If it is not root, create a callgraph using given filePaths
        List<String> files = isRoot ? GeneralUtils.getFilesBySuffixInPaths("java", rootPath, true) : filePaths;
        for (String javaFile: files) {
            extract(rootPath, javaFile, nodes, edges);
        }

        return new CallGraph(nodes, edges);
    }


    private void extract(String srcPath, String javaFile, HashMap<String, CallGraphNode> nodes, ArrayList<CallGraphEdge> edges) {
        CompilationUnit cu = null;
        try {
            cu = StaticJavaParser.parse(new FileInputStream(javaFile));
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        // Get the method declaration and traverse it
        List<MethodDeclaration> all = cu.findAll(MethodDeclaration.class);
        for (MethodDeclaration methodDeclaration : all) {
            ArrayList<String> calleeFunctions = new ArrayList<>();
            CallGraphNode callGraphNode = null;

            // Iterate over the contents of each method declaration to find other methods that are called internally
            methodDeclaration.accept(new MethodCallVisitor(), calleeFunctions);
            String functionSignature;
            String functionName;
            String className;
            String packageName;

            try {
                functionSignature = GeneralUtils.simplifySignature(methodDeclaration.resolve().getQualifiedSignature(), false);
                functionName = methodDeclaration.resolve().getName();
                className = methodDeclaration.resolve().getClassName();
                packageName = methodDeclaration.resolve().getPackageName();
                String filePath = javaFile.substring(srcPath.length() + 1);
                callGraphNode = new CallGraphNode(className, functionName, packageName, functionSignature, filePath);
            } catch (Exception e) {
                functionSignature = GeneralUtils.simplifySignature(methodDeclaration.getSignature().asString(), false);
                continue;
            }
            assert functionSignature != null;

            nodes.put(functionSignature, callGraphNode);
            for (String calleeSignature: calleeFunctions) {
                edges.add(new CallGraphEdge(functionSignature, calleeSignature));
            }

            // Remove possible duplicates
            HashSet<CallGraphEdge> edgeSet = new HashSet<>(edges);
            edges.clear();
            edges.addAll(edgeSet);
        }
    }

    private static class MethodCallVisitor extends VoidVisitorAdapter<List<String>> {
        public MethodCallVisitor() {}

        public void visit(MethodCallExpr n, List<String> calleeFunctions) {
            ResolvedMethodDeclaration resolvedMethodDeclaration = null;
            try {
                resolvedMethodDeclaration = n.resolve();
                String signature = GeneralUtils.simplifySignature(resolvedMethodDeclaration.getQualifiedSignature(), false);
                if (resolvedMethodDeclaration instanceof JavaParserMethodDeclaration) {
                    calleeFunctions.add(signature);
                }
            } catch (Exception e) {
//                logger.error("Line {}, {} cannot resolve some symbol, because {}",
//                        n.getRange().get().begin.line,
//                        n.getNameAsString() + n.getArguments().toString().replace("[", "(").replace("]", ")"),
//                        e.getMessage());
            }
            // Don't forget to call super, it may find more method calls inside the arguments of this method call, for example.
            super.visit(n, calleeFunctions);
        }
    }
}
