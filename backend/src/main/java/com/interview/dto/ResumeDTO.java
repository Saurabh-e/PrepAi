package com.interview.dto;

import com.interview.model.Resume;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for resume information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeDTO {

    private String id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String fileUrl;
    private List<String> parsedSkills;
    private Resume.ResumeAnalysis analysis;
    private LocalDateTime uploadedAt;
}
