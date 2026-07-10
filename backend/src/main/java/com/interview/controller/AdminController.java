package com.interview.controller;

import com.interview.dto.ApiResponse;
import com.interview.dto.UserProfileDTO;
import com.interview.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for admin operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin API")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<Page<UserProfileDTO>>> getAllUsers(Pageable pageable) {
        log.info("GET /api/v1/admin/users");
        Page<UserProfileDTO> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/search")
    @Operation(summary = "Search users")
    public ResponseEntity<ApiResponse<Page<UserProfileDTO>>> searchUsers(
            @RequestParam String email, Pageable pageable) {
        log.info("GET /api/v1/admin/users/search - email: {}", email);
        Page<UserProfileDTO> users = adminService.searchUsers(email, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserById(@PathVariable String userId) {
        log.info("GET /api/v1/admin/users/{}", userId);
        UserProfileDTO user = adminService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PatchMapping("/users/{userId}/suspend")
    @Operation(summary = "Suspend user")
    public ResponseEntity<ApiResponse<String>> suspendUser(@PathVariable String userId) {
        log.info("PATCH /api/v1/admin/users/{}/suspend", userId);
        adminService.suspendUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User suspended successfully", null));
    }

    @PatchMapping("/users/{userId}/activate")
    @Operation(summary = "Activate user")
    public ResponseEntity<ApiResponse<String>> activateUser(@PathVariable String userId) {
        log.info("PATCH /api/v1/admin/users/{}/activate", userId);
        adminService.activateUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", null));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete user")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable String userId) {
        log.info("DELETE /api/v1/admin/users/{}", userId);
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get platform analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformAnalytics() {
        log.info("GET /api/v1/admin/analytics");
        Map<String, Object> analytics = adminService.getPlatformAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/ai-usage")
    @Operation(summary = "Get AI usage statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAIUsageStatistics() {
        log.info("GET /api/v1/admin/ai-usage");
        Map<String, Object> stats = adminService.getAIUsageStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
