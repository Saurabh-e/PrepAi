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

/**
 * Resume entity for storing user resumes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resumes")
public class Resume {

    @Id
    private String id;

    private String userId;

    private String fileName;

    private String fileType;

    private Long fileSize;

    private String fileUrl;

    private String filePath;

    private String extractedText;

    @Builder.Default
    private List<String> parsedSkills = new ArrayList<>();

    private ParsedResumeData parsedData;

    private String cloudinaryPublicId;

    private ResumeAnalysis analysis;

    @CreatedDate
    private LocalDateTime uploadedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParsedResumeData {
        private String name;
        private String email;
        private String phone;
        private List<String> education;
        private List<String> experience;
        private List<String> certifications;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeAnalysis {
        private Integer atsScore;
        private List<String> strengths;
        private List<String> improvements;
        private List<String> recommendedSkills;
        private String feedbackSummary;
    }
}
