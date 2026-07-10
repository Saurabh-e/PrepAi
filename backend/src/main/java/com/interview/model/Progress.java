package com.interview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Progress entity for tracking user progress
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "progress")
public class Progress {

    @Id
    private String id;

    private String userId;

    private Integer totalInterviews;

    private Double averageScore;

    private Double highestScore;

    @Builder.Default
    private Map<String, DomainProgress> domainProgress = new HashMap<>();

    @Builder.Default
    private Map<String, SkillAnalytics> skillAnalytics = new HashMap<>();

    @LastModifiedDate
    private LocalDateTime lastUpdated;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DomainProgress {
        private Integer interviewsCompleted;
        private Double averageScore;
        private Interview.Difficulty lastDifficulty;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillAnalytics {
        private Double averageScore;
        private Integer timesAssessed;
        private String strength; // STRONG, MODERATE, WEAK
    }
}
