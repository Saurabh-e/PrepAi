package com.interview.controller;

import com.interview.dto.ApiResponse;
import com.interview.dto.DashboardDTO;
import com.interview.service.DashboardService;
import com.interview.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for dashboard operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard API")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get user dashboard")
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboard() {
        log.info("GET /api/v1/dashboard");
        String userId = securityUtils.getCurrentUserId();
        DashboardDTO dashboard = dashboardService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
