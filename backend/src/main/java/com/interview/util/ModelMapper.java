package com.interview.util;

import com.interview.dto.*;
import com.interview.model.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Utility class for mapping between entities and DTOs
 */
@Component
public class ModelMapper {

    public UserProfileDTO toUserProfileDTO(User user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .roles(user.getRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet()))
                .skills(user.getSkills())
                .experience(user.getExperience())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    public AuthResponse.UserDTO toUserDTO(User user) {
        return AuthResponse.UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet()))
                .build();
    }

    public InterviewDTO toInterviewDTO(Interview interview) {
        return InterviewDTO.builder()
                .id(interview.getId())
                .jobRole(interview.getJobRole())
                .domain(interview.getDomain())
                .difficulty(interview.getDifficulty())
                .totalQuestions(interview.getTotalQuestions())
                .completedQuestions(interview.getCompletedQuestions())
                .status(interview.getStatus())
                .overallScore(interview.getOverallScore())
                .startedAt(interview.getStartedAt())
                .completedAt(interview.getCompletedAt())
                .durationMinutes(interview.getDurationMinutes())
                .build();
    }

    public QuestionDTO toQuestionDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .questionNumber(question.getQuestionNumber())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .difficulty(question.getDifficulty())
                .askedAt(question.getAskedAt())
                .isCodingProblem(question.getIsCodingProblem())
                .problemTitle(question.getProblemTitle())
                .problemDescription(question.getProblemDescription())
                .inputSpecification(question.getInputSpecification())
                .outputSpecification(question.getOutputSpecification())
                .sampleTestsJson(question.getSampleTestsJson())
                .timeLimit(question.getTimeLimit())
                .memoryLimit(question.getMemoryLimit())
                .note(question.getNote())
                .build();
    }

    public AnswerDTO toAnswerDTO(Answer answer) {
        return AnswerDTO.builder()
                .id(answer.getId())
                .questionId(answer.getQuestionId())
                .answerText(answer.getAnswerText())
                .score(answer.getScore())
                .technicalFeedback(answer.getTechnicalFeedback())
                .communicationFeedback(answer.getCommunicationFeedback())
                .improvements(answer.getImprovements())
                .answeredAt(answer.getAnsweredAt())
                .responseTimeSeconds(answer.getResponseTimeSeconds())
                .build();
    }

    public ResumeDTO toResumeDTO(Resume resume) {
        return ResumeDTO.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .fileType(resume.getFileType())
                .fileSize(resume.getFileSize())
                .fileUrl(resume.getFileUrl())
                .parsedSkills(resume.getParsedSkills())
                .analysis(resume.getAnalysis())
                .uploadedAt(resume.getUploadedAt())
                .build();
    }
}
