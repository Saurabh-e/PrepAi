package com.interview.controller;

import com.interview.dto.ApiResponse;
import com.interview.service.CppCompilerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/compiler")
@RequiredArgsConstructor
@Tag(name = "Compiler", description = "C++ Code Compilation & Execution API")
public class CompilerController {

    private final CppCompilerService cppCompilerService;

    @Data
    public static class CompileRunRequest {
        private String sourceCode;
        private String input;
    }

    @PostMapping("/run")
    @Operation(summary = "Compile and execute C++ code")
    public ResponseEntity<ApiResponse<CppCompilerService.ExecutionResult>> compileAndRun(
            @RequestBody CompileRunRequest request) {
        log.info("POST /api/v1/compiler/run");
        CppCompilerService.ExecutionResult result = cppCompilerService.compileAndRun(
                request.getSourceCode(), 
                request.getInput()
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
