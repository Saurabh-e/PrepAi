package com.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for answer with feedback
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDTO {

    private String id;
    private String questionId;
    private String answerText;
    private Double score;
    private String technicalFeedback;
    private String communicationFeedback;
    private String improvements;
    private LocalDateTime answeredAt;
    private Long responseTimeSeconds;
}
