package com.interview.dto;

import com.interview.model.Interview;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for starting an interview
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartInterviewRequest {

    @NotBlank(message = "Job role is required")
    private String jobRole;

    @NotNull(message = "Domain is required")
    private Interview.InterviewDomain domain;

    @NotNull(message = "Difficulty is required")
    private Interview.Difficulty difficulty;

    @NotNull(message = "Number of questions is required")
    @Min(value = 1, message = "Minimum 1 question required")
    @Max(value = 20, message = "Maximum 20 questions allowed")
    private Integer numberOfQuestions;
}
