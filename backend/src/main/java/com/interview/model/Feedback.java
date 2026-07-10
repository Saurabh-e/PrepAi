package com.interview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Feedback entity for storing overall interview feedback
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feedback")
public class Feedback {

    @Id
    private String id;

    private String interviewId;

    private String userId;

    private Double overallScore;

    private String overallSummary;

    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> weaknesses = new ArrayList<>();

    @Builder.Default
    private List<String> recommendations = new ArrayList<>();

    @Builder.Default
    private List<LearningResource> learningResources = new ArrayList<>();

    private Map<String, Double> skillScores;

    private CommunicationAnalysis communication;

    @CreatedDate
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningResource {
        private String topic;
        private String resourceUrl;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommunicationAnalysis {
        private Double clarity;
        private Double articulation;
        private Double confidence;
        private String feedback;
    }
}
