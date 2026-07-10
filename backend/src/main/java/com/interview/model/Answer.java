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
 * Answer entity representing user answers
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "answers")
public class Answer {

    @Id
    private String id;

    private String questionId;

    private String interviewId;

    private String userId;

    private String answerText;

    private Double score;

    private String technicalFeedback;

    private String communicationFeedback;

    private String improvements;

    @Builder.Default
    private String aiResponse = "";

    @CreatedDate
    private LocalDateTime answeredAt;

    private Long responseTimeSeconds;
}
