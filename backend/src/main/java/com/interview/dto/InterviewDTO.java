package com.interview.dto;

import com.interview.model.Interview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for interview data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDTO {

    private String id;
    private String jobRole;
    private Interview.InterviewDomain domain;
    private Interview.Difficulty difficulty;
    private Integer totalQuestions;
    private Integer completedQuestions;
    private Interview.InterviewStatus status;
    private Double overallScore;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long durationMinutes;
}
