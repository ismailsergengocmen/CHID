package com.callgraph.utils;

import ch.uzh.ifi.seal.changedistiller.ChangeDistiller;
import ch.uzh.ifi.seal.changedistiller.distilling.FileDistiller;
import ch.uzh.ifi.seal.changedistiller.model.classifiers.ChangeType;
import ch.uzh.ifi.seal.changedistiller.model.entities.SourceCodeChange;
import com.callgraph.model.pr.ChangedFileWithSha;
import com.callgraph.model.pr.FileStatus;

import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class CallgraphUtils {
    public static boolean downloadDependencyJars(String dependencyType, ArrayList<String> dependencyFilePaths, String srcPath) {
        if (dependencyType.equals("maven")) {
            String command = "mvn dependency:copy-dependencies";
            for (String dependencyFilePath: dependencyFilePaths) {
                try {
                    CommandUtils.runCommandInPath(command, dependencyFilePath);
                } catch (IOException | InterruptedException e) {
                    e.printStackTrace();
                }
            }
        } else {
            for (String dependencyFilePath: dependencyFilePaths) {
                StringBuilder fileContent = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new FileReader(dependencyFilePath + "/build.gradle"))) {
                    String line;
                    boolean taskFound = false;
                    while ((line = reader.readLine()) != null) {
                        fileContent.append(line).append(System.lineSeparator());
                        if (line.trim().startsWith("task copyDependencies")) {
                            taskFound = true;
                        }
                    }

                    if (!taskFound) {
                        if (fileContent.charAt(fileContent.length() - 1) == '\n') {
                            fileContent.deleteCharAt(fileContent.length() - 1);
                        }
                        fileContent.append(System.lineSeparator());
                        fileContent.append("task copyDependencies(type: Copy) {").append(System.lineSeparator());
                        fileContent.append("    from configurations.runtimeClasspath").append(System.lineSeparator());
                        fileContent.append("    into 'target'").append(System.lineSeparator());
                        fileContent.append("    include '*.jar'").append(System.lineSeparator());
                        fileContent.append("}").append(System.lineSeparator());
                        try (BufferedWriter writer = new BufferedWriter(new FileWriter(dependencyFilePath + "/build.gradle"))) {
                            writer.write(fileContent.toString());
                        }
                    }

                    String command = "gradlew copyDependencies";
                    try {
                        CommandUtils.runCommandInPath(command, dependencyFilePath);
                    } catch (IOException | InterruptedException e) {
                        e.printStackTrace();
                    }
                } catch (IOException e) {
                    System.err.println("An error occurred while processing the build.gradle file: " + e.getMessage());
                    return false;
                }
            }

            // Remove the added copyDependencies task from the build.gradle files
            try {
                CommandUtils.runCommandInPath("git reset --hard", srcPath);
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
            }
        }
        return true;
    }

    public static HashMap<String, ChangeType> calculateChangeSet(String srcPath, String prNumber, ArrayList<ChangedFileWithSha> changedFilesWithSha) {
        boolean isWindows = System.getProperty("os.name").contains("Windows");
        FileDistiller distiller = ChangeDistiller.createFileDistiller(ChangeDistiller.Language.JAVA);

        String folderPath = srcPath.substring(0, srcPath.lastIndexOf("\\")) + "\\" + prNumber;

        CommandUtils.runCommand(srcPath, "mkdir " + folderPath, isWindows);

        HashMap<String, ChangeType> changeMap = new HashMap<>();

        if (!changedFilesWithSha.isEmpty()) {
            for (ChangedFileWithSha changedFile : changedFilesWithSha) {
                if (changedFile.getStatus() == FileStatus.ADDED) {
                    continue;
                }

                String shaOld = changedFile.getOldSha();
                String shaNew = changedFile.getNewSha();

                String command1 = "git show " + shaOld + " > " + folderPath + "\\" + shaOld + ".java";
                CommandUtils.runCommand(srcPath, command1, isWindows);

                String newFileName;

                if (changedFile.getStatus() == FileStatus.REMOVED) {
                    int index = (changedFile.getFileName()).lastIndexOf(".");
                    String fileName = (changedFile.getFileName()).substring(0, index);
                    GeneralUtils.createEmptyClassFile(fileName, folderPath);
                    newFileName = changedFile.getFileName();
                } else {
                    String command2 = "git show " + shaNew + " > " + folderPath + "\\" + shaNew + ".java";
                    CommandUtils.runCommand(srcPath, command2, isWindows);
                    newFileName = shaNew + ".java";
                }

                File left = new File(folderPath + "\\" + shaOld + ".java");
                File right = new File(folderPath + "\\" + newFileName);

                try {
                    distiller.extractClassifiedSourceCodeChanges(left, right);
                } catch (Exception e) {
                    System.err.println("Warning: error while change distilling. " + e.getMessage());
                }

                List<SourceCodeChange> changes = distiller.getSourceCodeChanges();

                if (changes != null) {
//                    System.out.println(changes);
                    for (SourceCodeChange change : changes) {
                        if (change.getRootEntity().getType().isMethod()) {
                            if (!changeMap.containsKey(change.getRootEntity().getUniqueName())) {
                                changeMap.put(change.getRootEntity().getUniqueName(), change.getChangeType());
                            } else {
                                // If there is a higher impact change, replace the current impact level with that impact level
                                if (changeMap.get(change.getRootEntity().getUniqueName()).getSignificance().value() < change.getChangeType().getSignificance().value()) {
                                    changeMap.put(change.getRootEntity().getUniqueName(), change.getChangeType());
                                }
                            }
                        } else if (change.getRootEntity().getType().isClass() && change.getLabel().equals("REMOVED_FUNCTIONALITY")) {
                            if (!changeMap.containsKey(change.getChangedEntity().getUniqueName())) {
                                changeMap.put(change.getChangedEntity().getUniqueName(), change.getChangeType());
                            } else {
                                // If there is a higher impact change, replace the current impact level with that impact level
                                if (changeMap.get(change.getChangedEntity().getUniqueName()).getSignificance().value() < change.getChangeType().getSignificance().value()) {
                                    changeMap.put(change.getChangedEntity().getUniqueName(), change.getChangeType());
                                }
                            }
                        }
                    }
                }
            }
        }
        CommandUtils.runCommand(srcPath, "rmdir " + folderPath + "/s /q", isWindows);

        return changeMap;
    }
}
