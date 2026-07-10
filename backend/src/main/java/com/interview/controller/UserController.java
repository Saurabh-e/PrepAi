package com.interview.controller;

import com.interview.dto.ApiResponse;
import com.interview.dto.ChangePasswordRequest;
import com.interview.dto.UpdateProfileRequest;
import com.interview.dto.UserProfileDTO;
import com.interview.service.UserService;
import com.interview.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for user management operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User Management API")
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getProfile() {
        log.info("GET /api/v1/users/profile");
        String userId = securityUtils.getCurrentUserId();
        UserProfileDTO profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        log.info("PUT /api/v1/users/profile");
        String userId = securityUtils.getCurrentUserId();
        UserProfileDTO profile = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change user password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("POST /api/v1/users/change-password");
        String userId = securityUtils.getCurrentUserId();
        userService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/profile-image")
    @Operation(summary = "Upload profile image")
    public ResponseEntity<ApiResponse<UserProfileDTO>> uploadProfileImage(
            @RequestParam("file") MultipartFile file) {
        log.info("POST /api/v1/users/profile-image");
        String userId = securityUtils.getCurrentUserId();
        UserProfileDTO profile = userService.uploadProfileImage(userId, file);
        return ResponseEntity.ok(ApiResponse.success("Profile image uploaded successfully", profile));
    }

    @PostMapping("/skills")
    @Operation(summary = "Add skill")
    public ResponseEntity<ApiResponse<String>> addSkill(@RequestParam String skill) {
        log.info("POST /api/v1/users/skills - Add skill: {}", skill);
        String userId = securityUtils.getCurrentUserId();
        userService.addSkill(userId, skill);
        return ResponseEntity.ok(ApiResponse.success("Skill added successfully", null));
    }

    @DeleteMapping("/skills")
    @Operation(summary = "Remove skill")
    public ResponseEntity<ApiResponse<String>> removeSkill(@RequestParam String skill) {
        log.info("DELETE /api/v1/users/skills - Remove skill: {}", skill);
        String userId = securityUtils.getCurrentUserId();
        userService.removeSkill(userId, skill);
        return ResponseEntity.ok(ApiResponse.success("Skill removed successfully", null));
    }
}
