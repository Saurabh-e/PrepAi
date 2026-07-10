package com.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for user dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    private Integer totalInterviews;
    private Double averageScore;
    private Double highestScore;
    private List<InterviewDTO> recentInterviews;
    private Map<String, Double> performanceTrend;
    private List<TopicStrength> weakTopics;
    private List<TopicStrength> strongTopics;
    private Map<String, SkillScore> skillAnalytics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicStrength {
        private String topic;
        private Double averageScore;
        private Integer timesAssessed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillScore {
        private Double score;
        private String strength;
    }
}
