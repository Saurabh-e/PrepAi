package com.interview.controller;

import com.interview.dto.ApiResponse;
import com.interview.dto.ResumeDTO;
import com.interview.exception.BadRequestException;
import com.interview.service.ResumeService;
import com.interview.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * REST controller for resume operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
@Tag(name = "Resume", description = "Resume API")
public class ResumeController {

    private final ResumeService resumeService;
    private final SecurityUtils securityUtils;

    @PostMapping("/upload")
    @Operation(summary = "Upload resume")
    public ResponseEntity<ApiResponse<ResumeDTO>> uploadResume(
            @RequestParam("file") MultipartFile file) {
        log.info("POST /api/v1/resumes/upload");
        String userId = securityUtils.getCurrentUserId();
        ResumeDTO resume = resumeService.uploadResume(userId, file);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume uploaded successfully", resume));
    }

    @GetMapping
    @Operation(summary = "Get all resumes")
    public ResponseEntity<ApiResponse<List<ResumeDTO>>> getUserResumes() {
        log.info("GET /api/v1/resumes");
        String userId = securityUtils.getCurrentUserId();
        List<ResumeDTO> resumes = resumeService.getUserResumes(userId);
        return ResponseEntity.ok(ApiResponse.success(resumes));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest resume")
    public ResponseEntity<ApiResponse<ResumeDTO>> getLatestResume() {
        log.info("GET /api/v1/resumes/latest");
        String userId = securityUtils.getCurrentUserId();
        ResumeDTO resume = resumeService.getLatestResume(userId);
        return ResponseEntity.ok(ApiResponse.success(resume));
    }

    @DeleteMapping("/{resumeId}")
    @Operation(summary = "Delete resume")
    public ResponseEntity<ApiResponse<String>> deleteResume(@PathVariable String resumeId) {
        log.info("DELETE /api/v1/resumes/{}", resumeId);
        String userId = securityUtils.getCurrentUserId();
        resumeService.deleteResume(userId, resumeId);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully", null));
    }

    @GetMapping("/{resumeId}/download-report")
    @Operation(summary = "Download resume analysis PDF report")
    public ResponseEntity<byte[]> downloadReport(@PathVariable String resumeId) {
        log.info("GET /api/v1/resumes/{}/download-report", resumeId);
        String userId = securityUtils.getCurrentUserId();
        byte[] pdfBytes = resumeService.generateResumeReportPdf(userId, resumeId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume-ats-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/{resumeId}/match-jd")
    @Operation(summary = "Match resume with a job description")
    public ResponseEntity<ApiResponse<Map<String, Object>>> matchResumeWithJD(
            @PathVariable String resumeId,
            @RequestBody Map<String, String> request) {
        log.info("POST /api/v1/resumes/{}/match-jd", resumeId);
        String userId = securityUtils.getCurrentUserId();
        String jobDescription = request.get("jobDescription");
        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            throw new BadRequestException("Job description is required");
        }
        Map<String, Object> result = resumeService.matchResumeWithJD(userId, resumeId, jobDescription);
        return ResponseEntity.ok(ApiResponse.success("Job description match calculated", result));
    }

    @PostMapping("/{resumeId}/download-match-report")
    @Operation(summary = "Download job description alignment PDF report")
    public ResponseEntity<byte[]> downloadMatchReport(
            @PathVariable String resumeId,
            @RequestBody Map<String, String> request) {
        log.info("POST /api/v1/resumes/{}/download-match-report", resumeId);
        String userId = securityUtils.getCurrentUserId();
        String jobDescription = request.get("jobDescription");
        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            throw new BadRequestException("Job description is required");
        }
        byte[] pdfBytes = resumeService.generateJdMatchReportPdf(userId, resumeId, jobDescription);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume-job-match-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
