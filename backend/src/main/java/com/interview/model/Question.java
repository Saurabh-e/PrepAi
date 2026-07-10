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
 * Question entity representing interview questions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "questions")
public class Question {

    @Id
    private String id;

    private String interviewId;

    private String userId;

    private Integer questionNumber;

    private String questionText;

    private String questionType;

    private Interview.Difficulty difficulty;

    private String aiGeneratedContext;

    // Coding Problem details (only populated for CODEFORCES domain)
    private Boolean isCodingProblem;
    private String problemTitle;
    private String problemDescription;
    private String inputSpecification;
    private String outputSpecification;
    private String sampleTestsJson; // Serialized list of SampleTest objects
    private String timeLimit;
    private String memoryLimit;
    private String note;

    @CreatedDate
    private LocalDateTime askedAt;
}
