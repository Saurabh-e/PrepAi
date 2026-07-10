package com.interview.controller;

import com.interview.dto.ApiResponse;
import com.interview.model.Notification;
import com.interview.service.NotificationService;
import com.interview.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for notification operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "Notification API")
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications() {
        log.info("GET /api/v1/notifications");
        String userId = securityUtils.getCurrentUserId();
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get paginated notifications")
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotificationsPaginated(Pageable pageable) {
        log.info("GET /api/v1/notifications/paginated");
        String userId = securityUtils.getCurrentUserId();
        Page<Notification> notifications = notificationService.getUserNotificationsPaginated(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications() {
        log.info("GET /api/v1/notifications/unread");
        String userId = securityUtils.getCurrentUserId();
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        log.info("GET /api/v1/notifications/unread/count");
        String userId = securityUtils.getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable String notificationId) {
        log.info("PATCH /api/v1/notifications/{}/read", notificationId);
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<String>> markAllAsRead() {
        log.info("PATCH /api/v1/notifications/read-all");
        String userId = securityUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
