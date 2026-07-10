package com.interview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Notification entity for user notifications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;

    private NotificationType type;

    private String title;

    private String message;

    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    public enum NotificationType {
        INTERVIEW_COMPLETED,
        RESUME_UPLOADED,
        PROFILE_UPDATED,
        ACHIEVEMENT_UNLOCKED,
        SYSTEM_ALERT
    }
}
