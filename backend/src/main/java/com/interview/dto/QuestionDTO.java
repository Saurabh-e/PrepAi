package com.interview.dto;

import com.interview.model.Interview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for interview questions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {

    private String id;
    private Integer questionNumber;
    private String questionText;
    private String questionType;
    private Interview.Difficulty difficulty;
    private LocalDateTime askedAt;

    // Coding Problem details (only populated for CODEFORCES domain)
    private Boolean isCodingProblem;
    private String problemTitle;
    private String problemDescription;
    private String inputSpecification;
    private String outputSpecification;
    private String sampleTestsJson;
    private String timeLimit;
    private String memoryLimit;
    private String note;
}
