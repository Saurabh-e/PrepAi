package com.interview.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for submitting answer to a question
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {

    @NotBlank(message = "Question ID is required")
    private String questionId;

    @NotBlank(message = "Answer is required")
    private String answerText;
}
