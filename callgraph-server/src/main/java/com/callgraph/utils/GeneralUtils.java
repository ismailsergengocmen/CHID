package com.callgraph.utils;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.common.collect.Lists;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;
import java.util.stream.Collectors;

public class GeneralUtils {
    public static List<String> getFilesBySuffixInPaths(String suffix, String path, boolean includeFileName) {
        List<String> filePaths = null;
        try {
            filePaths = Files.find(Paths.get(path), Integer.MAX_VALUE, (filePath, fileAttr) -> fileAttr.isRegularFile())
                    .filter(f -> f.toString().toLowerCase().endsWith(suffix))
                    .map(f -> includeFileName ? f.toString() : f.getParent().toString())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }

        return filePaths;
    }

    /**
     * This method removes the package info from argument list of a method signature + function name if simplifyFunctionName = true
     */
    public static String simplifySignature(String signature, boolean simplifyFunctionName) {
        int start = signature.indexOf("(");
        int end = signature.lastIndexOf(")");

        String functionName = simplifyFunctionName ? signature.substring(signature.lastIndexOf('.') + 1, start) : signature.substring(0, start);
        String arguments = signature.substring(start + 1, end);

        ArrayList<String> argumentsList = splitByComma(arguments);
        argumentsList.replaceAll(GeneralUtils::simplifyArgument);

        return functionName + "(" + String.join(",", argumentsList) + ")"; // There is no space after comma because there is also no space in ChangeDistiller
    }

    public static String getProjectSrcPath(String projectIdentifier) {
        boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("windows");
        String currentPath = System.getProperty("user.dir");
        String pathSeperator = isWindows ? "\\" : "/";

        String upperLevelPath = currentPath.substring(0, currentPath.lastIndexOf(pathSeperator));

        return upperLevelPath + "/" + "change_impact_detector/analyzed_repositories" + "/" + projectIdentifier;
    }

    public static void createEmptyClassFile(String className, String filePath) {
        File file = new File(filePath + "/" + className + ".java");
        try {
            file.createNewFile();
            FileWriter fw = new FileWriter(file);
            fw.write("class " + className + " { }");
            fw.close();
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }

    public static String uploadFileToFirebaseStorage(String keyPath, String projectId, String bucketName, String objectName, String filePath) {
        try {
            FileInputStream serviceAccount = new FileInputStream(keyPath);
            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
            Storage storage = StorageOptions.newBuilder().setCredentials(credentials).setProjectId(projectId).build().getService();

            BlobId blobId = BlobId.of(bucketName, objectName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("image/svg+xml").build();
            storage.create(blobInfo, new FileInputStream(filePath));

            String timestamp = String.valueOf(Instant.now().toEpochMilli());
            String imageUrl = String.format("https://storage.googleapis.com/%s/%s?v=%s", bucketName, objectName, timestamp);
            System.out.println("File uploaded successfully. URL: " + imageUrl);
            return imageUrl;
        } catch (IOException e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public static void gitCheckoutAndPull(String srcPath, String branchName) {
        try {
            ArrayList<String> commands = new ArrayList<>();
            commands.add("git checkout " + branchName);
            commands.add("git pull");

            CommandUtils.runCommandsInPath(commands, srcPath);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    /**
     * This method removes package info from given single argument
     */
    private static String simplifyArgument(String argument) {
        if (!argument.contains("<")) {
            // No generics part
            return processDottedPart(argument);
        } else {
            // Has generics part
            int start = argument.indexOf("<");
            int end = argument.lastIndexOf(">");

            String basicPart = argument.substring(0, start);
            String genericsPart = argument.substring(start + 1, end);

            String basicPartProcessed = processDottedPart(basicPart);

            ArrayList<String> parts = splitByComma(genericsPart);
            ArrayList<String> simplifiedGenerics = new ArrayList<>();

            for (String part: parts) {
                simplifiedGenerics.add(simplifyArgument(part));
            }
            String genericsPartProcessed = String.join(", ", simplifiedGenerics);

            return basicPartProcessed + "<" + genericsPartProcessed + ">";
        }
    }

    /**
     * This method is used to convert xyz.abc.qwr to qwr
     */
    private static String processDottedPart(String signature) {
        int lastDotIndex = signature.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return signature;
        } else {
            return signature.substring(lastDotIndex + 1);
        }
    }

    /**
     * This method is used to split variables seperated by commas.
     * When separating, generics part are preserved.
     */
    private static ArrayList<String> splitByComma(String signature) {
        ArrayList<String> seperated = new ArrayList<>();
        Stack<Character> generics = new Stack<>();
        StringBuilder current = new StringBuilder();

        for (Character ch: Lists.charactersOf(signature)) {
            if (ch.equals('<')) {
                generics.push('<');
            } else if (ch.equals('>')) {
                generics.pop();
            } else if (ch.equals(',') && generics.isEmpty()) {
                seperated.add(current.toString());
                current = new StringBuilder();
                continue;
            }
            current.append(ch);
        }

        if (current.length() > 0) {
            seperated.add((current.toString()));
        }

        for (int i = 0; i < seperated.size(); i++) {
            String currentVal = seperated.get(i);
            if (currentVal.startsWith(" ")) {
                seperated.set(i, currentVal.substring(1));
            }
        }

        return seperated;
    }
}
