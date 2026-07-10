package com.interview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Interview entity representing interview sessions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;

    private String userId;

    private String jobRole;

    private InterviewDomain domain;

    private Difficulty difficulty;

    private Integer totalQuestions;

    private Integer completedQuestions;

    @Builder.Default
    private InterviewStatus status = InterviewStatus.IN_PROGRESS;

    @Builder.Default
    private List<String> questionIds = new ArrayList<>();

    private Double overallScore;

    private String overallFeedback;

    private String aiModel;

    @CreatedDate
    private LocalDateTime startedAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    private Long durationMinutes;

    public enum InterviewDomain {
        JAVA, SPRING_BOOT, MERN, DSA, HR, SQL, JAVASCRIPT, CODEFORCES
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum InterviewStatus {
        IN_PROGRESS, COMPLETED, PAUSED, ABANDONED
    }
}
