package com.interview.service;

import com.interview.model.Notification;
import com.interview.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for notification operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(String userId, Notification.NotificationType type,
                                          String title, String message) {
        log.info("Creating notification for user: {}", userId);

        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        log.info("Getting notifications for user: {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Page<Notification> getUserNotificationsPaginated(String userId, Pageable pageable) {
        log.info("Getting paginated notifications for user: {}", userId);
        return notificationRepository.findByUserId(userId, pageable);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        log.info("Getting unread notifications for user: {}", userId);
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(String notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        
        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        
        notificationRepository.saveAll(unreadNotifications);
    }
}
