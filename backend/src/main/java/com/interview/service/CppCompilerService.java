package com.interview.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class CppCompilerService {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExecutionResult {
        private boolean compiled;
        private String compilerMessage;
        private String stdout;
        private String stderr;
        private int exitCode;
        private long timeMs;
        private boolean timeout;
    }

    /**
     * Compiles and runs C++ source code with the given input and returns the result.
     */
    public ExecutionResult compileAndRun(String sourceCode, String input) {
        String uuid = UUID.randomUUID().toString();
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
        
        File workingDir = new File(System.getProperty("user.dir"), "temp_compile");
        if (!workingDir.exists()) {
            workingDir.mkdirs();
        }

        File sourceFile = new File(workingDir, "Solution_" + uuid + ".cpp");
        String exeName = "Solution_" + uuid + (isWindows ? ".exe" : "");
        File exeFile = new File(workingDir, exeName);

        try {
            // 1. Write source code to file
            Files.writeString(sourceFile.toPath(), sourceCode, StandardCharsets.UTF_8);

            // 2. Compile source code using g++
            ProcessBuilder compilePb = new ProcessBuilder("g++", "-O3", sourceFile.getName(), "-o", exeName);
            compilePb.directory(workingDir);
            
            Process compileProcess = compilePb.start();
            String compilerError = readStream(compileProcess.getErrorStream());
            String compilerOut = readStream(compileProcess.getInputStream());
            
            boolean compileCompleted = compileProcess.waitFor(10, TimeUnit.SECONDS);
            if (!compileCompleted) {
                compileProcess.destroyForcibly();
                return ExecutionResult.builder()
                        .compiled(false)
                        .compilerMessage("Compilation timed out (exceeded 10 seconds).")
                        .build();
            }

            int compileExitCode = compileProcess.exitValue();
            if (compileExitCode != 0) {
                return ExecutionResult.builder()
                        .compiled(false)
                        .compilerMessage(compilerError.isEmpty() ? compilerOut : compilerError)
                        .build();
            }

            // 3. Execute compiled binary
            ProcessBuilder runPb;
            if (isWindows) {
                runPb = new ProcessBuilder(exeFile.getAbsolutePath());
            } else {
                runPb = new ProcessBuilder("./" + exeName);
            }
            runPb.directory(workingDir);

            long startTime = System.currentTimeMillis();
            Process runProcess = runPb.start();

            // Inject standard input
            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream(), StandardCharsets.UTF_8))) {
                    writer.write(input);
                    writer.flush();
                }
            }

            // Wait with a 2-second timeout
            boolean runCompleted = runProcess.waitFor(2, TimeUnit.SECONDS);
            long timeMs = System.currentTimeMillis() - startTime;

            if (!runCompleted) {
                runProcess.destroyForcibly();
                return ExecutionResult.builder()
                        .compiled(true)
                        .timeout(true)
                        .timeMs(timeMs)
                        .stderr("Time Limit Exceeded (exceeded 2.0 seconds)")
                        .stdout("")
                        .build();
            }

            String stdout = readStream(runProcess.getInputStream());
            String stderr = readStream(runProcess.getErrorStream());
            int runExitCode = runProcess.exitValue();

            return ExecutionResult.builder()
                    .compiled(true)
                    .timeout(false)
                    .stdout(stdout)
                    .stderr(stderr)
                    .exitCode(runExitCode)
                    .timeMs(timeMs)
                    .build();

        } catch (Exception e) {
            log.error("Error during compilation/execution step", e);
            return ExecutionResult.builder()
                    .compiled(false)
                    .compilerMessage("System execution error: " + e.getMessage())
                    .build();
        } finally {
            // 4. Cleanup temporary files
            try {
                if (sourceFile.exists()) {
                    sourceFile.delete();
                }
                if (exeFile.exists()) {
                    exeFile.delete();
                }
            } catch (Exception e) {
                log.warn("Failed to delete temp files: {}", e.getMessage());
            }
        }
    }

    private String readStream(InputStream stream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line).append("\n");
            }
            return builder.toString().trim();
        }
    }
}
