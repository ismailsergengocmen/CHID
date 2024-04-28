package com.callgraph.utils;

import java.io.*;
import java.util.ArrayList;

public class CommandUtils {
    public static void runCommand(String locationPath, String command, boolean isWindows) {
        ProcessBuilder processBuilder = new ProcessBuilder();
        File location = new File(locationPath);
        processBuilder.directory(location);

        if (isWindows) {
            processBuilder.command("cmd.exe", "/c", command);
        } else {
            processBuilder.command("sh", "-c", command);
        }

        try {
            Process p = processBuilder.start();
            p.waitFor();
        } catch (IOException | InterruptedException e) {
            System.out.println(e.getMessage());
        }
    }

    public static void runCommandInPath(String command, String path) throws IOException, InterruptedException {
        ProcessBuilder builder;
        if (System.getProperty("os.name").contains("Windows")) {
            builder = new ProcessBuilder("cmd.exe", "/c", command);
        } else {
            builder = new ProcessBuilder("sh", "-c", command);
        }
        builder.directory(new File(path));
        builder.redirectErrorStream(true);
        Process process = builder.start();

        // read and print the output from the command
        InputStream inputStream = process.getInputStream();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }
        reader.close();

        // wait for the command to finish
        int exitCode = process.waitFor();
        System.out.println("Command exited with code " + exitCode);
    }

    public static void runCommandsInPath(ArrayList<String> commands, String path) throws IOException, InterruptedException {
        ProcessBuilder builder;
        boolean isWindows = System.getProperty("os.name").contains("Windows");

        for (String command: commands) {
            if (isWindows) {
                builder = new ProcessBuilder("cmd.exe", "/c", command);
            } else {
                builder = new ProcessBuilder("sh", "-c", command);
            }
            builder.directory(new File(path));
            builder.redirectErrorStream(true);
            Process process = builder.start();

            // read and print the output from the command
            InputStream inputStream = process.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
            reader.close();

            // wait for the command to finish
            int exitCode = process.waitFor();
            System.out.println("Command exited with code " + exitCode);
        }
    }
}
