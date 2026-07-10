package com.interview.controller;

import com.interview.dto.*;
import com.interview.service.InterviewService;
import com.interview.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for interview operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@Tag(name = "Interview", description = "Interview API")
public class InterviewController {

    private final InterviewService interviewService;
    private final SecurityUtils securityUtils;

    @PostMapping("/start")
    @Operation(summary = "Start new interview")
    public ResponseEntity<ApiResponse<InterviewDTO>> startInterview(
            @Valid @RequestBody StartInterviewRequest request) {
        log.info("POST /api/v1/interviews/start");
        String userId = securityUtils.getCurrentUserId();
        InterviewDTO interview = interviewService.startInterview(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview started successfully", interview));
    }

    @GetMapping("/current")
    @Operation(summary = "Get current active interview")
    public ResponseEntity<ApiResponse<InterviewDTO>> getCurrentInterview() {
        log.info("GET /api/v1/interviews/current");
        String userId = securityUtils.getCurrentUserId();
        InterviewDTO interview = interviewService.getCurrentInterview(userId);
        return ResponseEntity.ok(ApiResponse.success(interview));
    }

    @GetMapping("/next-question")
    @Operation(summary = "Get next question")
    public ResponseEntity<ApiResponse<QuestionDTO>> getNextQuestion(@RequestParam String interviewId) {
        log.info("GET /api/v1/interviews/next-question");
        String userId = securityUtils.getCurrentUserId();
        QuestionDTO question = interviewService.getNextQuestion(userId, interviewId);
        return ResponseEntity.ok(ApiResponse.success(question));
    }

    @PostMapping("/submit-answer")
    @Operation(summary = "Submit answer to question")
    public ResponseEntity<ApiResponse<AnswerDTO>> submitAnswer(
            @Valid @RequestBody SubmitAnswerRequest request) {
        log.info("POST /api/v1/interviews/submit-answer");
        String userId = securityUtils.getCurrentUserId();
        AnswerDTO answer = interviewService.submitAnswer(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Answer submitted successfully", answer));
    }

    @PostMapping("/{interviewId}/end")
    @Operation(summary = "End interview")
    public ResponseEntity<ApiResponse<String>> endInterview(@PathVariable String interviewId) {
        log.info("POST /api/v1/interviews/{}/end", interviewId);
        String userId = securityUtils.getCurrentUserId();
        interviewService.endInterview(userId, interviewId);
        return ResponseEntity.ok(ApiResponse.success("Interview ended successfully", null));
    }

    @GetMapping("/history")
    @Operation(summary = "Get interview history")
    public ResponseEntity<ApiResponse<Page<InterviewDTO>>> getInterviewHistory(Pageable pageable) {
        log.info("GET /api/v1/interviews/history");
        String userId = securityUtils.getCurrentUserId();
        Page<InterviewDTO> history = interviewService.getInterviewHistory(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/{interviewId}")
    @Operation(summary = "Get interview details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInterviewDetails(
            @PathVariable String interviewId) {
        log.info("GET /api/v1/interviews/{}", interviewId);
        String userId = securityUtils.getCurrentUserId();
        Map<String, Object> details = interviewService.getInterviewDetails(userId, interviewId);
        return ResponseEntity.ok(ApiResponse.success(details));
    }
}
