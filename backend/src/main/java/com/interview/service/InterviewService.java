package com.interview.service;

import com.interview.dto.*;
import com.interview.exception.BadRequestException;
import com.interview.exception.ResourceNotFoundException;
import com.interview.model.*;
import com.interview.repository.*;
import com.interview.util.ModelMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for interview operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final FeedbackRepository feedbackRepository;
    private final ProgressRepository progressRepository;
    private final GroqAIService groqAIService;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;
    private final CodeforcesService codeforcesService;
    private final CppCompilerService cppCompilerService;
    private final ObjectMapper objectMapper;

    @Value("${groq.model}")
    private String aiModel;

    @Transactional
    public InterviewDTO startInterview(String userId, StartInterviewRequest request) {
        log.info("Starting interview for user: {}", userId);

        // Check for existing in-progress interview
        interviewRepository.findFirstByUserIdAndStatusOrderByStartedAtDesc(
                userId, Interview.InterviewStatus.IN_PROGRESS
        ).ifPresent(existingInterview -> {
            // Clean up stuck interviews that failed during first question generation
            if (existingInterview.getQuestionIds() == null || existingInterview.getQuestionIds().isEmpty()) {
                log.warn("Found stuck in-progress interview with no questions, deleting: {}", existingInterview.getId());
                interviewRepository.delete(existingInterview);
            } else {
                throw new BadRequestException("You already have an interview in progress. Please complete or end it first.");
            }
        });

        // Create interview
        Interview interview = Interview.builder()
                .userId(userId)
                .jobRole(request.getJobRole())
                .domain(request.getDomain())
                .difficulty(request.getDifficulty())
                .totalQuestions(request.getNumberOfQuestions())
                .completedQuestions(0)
                .status(Interview.InterviewStatus.IN_PROGRESS)
                .aiModel(aiModel)
                .questionIds(new ArrayList<>())
                .build();

        interview = interviewRepository.save(interview);
        log.info("Interview created with ID: {}", interview.getId());

        // Generate first question
        try {
            generateNextQuestion(interview);
        } catch (Exception e) {
            log.error("Failed to generate first question for interview, deleting interview record", e);
            interviewRepository.delete(interview);
            throw e;
        }

        return modelMapper.toInterviewDTO(interview);
    }

    @Transactional
    public AnswerDTO submitAnswer(String userId, SubmitAnswerRequest request) {
        log.info("Submitting answer for question: {}", request.getQuestionId());

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", request.getQuestionId()));

        Interview interview = interviewRepository.findById(question.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", question.getInterviewId()));

        if (!interview.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to interview");
        }

        if (answerRepository.existsByQuestionId(question.getId())) {
            throw new BadRequestException("Answer already submitted for this question");
        }

        // Evaluate answer using AI or Compiler
        Map<String, Object> evaluation;
        if (interview.getDomain() == Interview.InterviewDomain.CODEFORCES) {
            String cppCode = request.getAnswerText();
            String testJson = question.getSampleTestsJson();
            int totalTests = 0;
            int passedTests = 0;
            StringBuilder runSummary = new StringBuilder();

            try {
                if (testJson != null && !testJson.isEmpty()) {
                    List<Map<String, String>> tests = objectMapper.readValue(
                            testJson, 
                            new TypeReference<List<Map<String, String>>>() {}
                    );
                    totalTests = tests.size();
                    for (int i = 0; i < totalTests; i++) {
                        Map<String, String> test = tests.get(i);
                        String input = test.get("input");
                        String expectedOutput = test.get("output").trim();
                        
                        CppCompilerService.ExecutionResult runRes = cppCompilerService.compileAndRun(cppCode, input);
                        if (!runRes.isCompiled()) {
                            runSummary.append("Compilation Error: ").append(runRes.getCompilerMessage()).append("\n");
                            break;
                        }
                        
                        if (runRes.isTimeout()) {
                            runSummary.append(String.format("Test Case %d: Time Limit Exceeded\n", i + 1));
                        } else if (runRes.getExitCode() != 0) {
                            runSummary.append(String.format("Test Case %d: Runtime Error (Exit Code %d)\nStderr:\n%s\n", i + 1, runRes.getExitCode(), runRes.getStderr()));
                        } else {
                            String actual = runRes.getStdout().trim();
                            boolean passed = actual.replaceAll("\\r\\n", "\n").equals(expectedOutput.replaceAll("\\r\\n", "\n"));
                            if (passed) {
                                passedTests++;
                                runSummary.append(String.format("Test Case %d: Passed (%d ms)\n", i + 1, runRes.getTimeMs()));
                            } else {
                                runSummary.append(String.format("Test Case %d: Failed\nInput:\n%s\nExpected:\n%s\nGot:\n%s\n", i + 1, input, expectedOutput, actual));
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed executing test cases for submission", e);
                runSummary.append("Failed running test cases due to system parsing error.");
            }

            String summaryStr = runSummary.toString();
            if (summaryStr.isEmpty()) {
                summaryStr = "No sample test cases provided.";
            }

            evaluation = groqAIService.evaluateCodingAnswer(
                    question.getProblemTitle(),
                    question.getProblemDescription(),
                    cppCode,
                    String.format("Ran %d test cases. Passed: %d\nSummary:\n%s", totalTests, passedTests, summaryStr),
                    interview.getDifficulty()
            );
        } else {
            evaluation = groqAIService.evaluateAnswer(
                    question.getQuestionText(),
                    request.getAnswerText(),
                    interview.getDomain(),
                    interview.getDifficulty()
            );
        }

        // Save answer
        Answer answer = Answer.builder()
                .questionId(question.getId())
                .interviewId(interview.getId())
                .userId(userId)
                .answerText(request.getAnswerText())
                .score((Double) evaluation.get("score"))
                .technicalFeedback((String) evaluation.get("technicalFeedback"))
                .communicationFeedback((String) evaluation.get("communicationFeedback"))
                .improvements((String) evaluation.get("improvements"))
                .aiResponse((String) evaluation.get("aiResponse"))
                .build();

        answer = answerRepository.save(answer);
        log.info("Answer saved with score: {}", answer.getScore());

        // Update interview progress
        interview.setCompletedQuestions(interview.getCompletedQuestions() + 1);
        interviewRepository.save(interview);

        // Generate next question if not completed
        if (interview.getCompletedQuestions() < interview.getTotalQuestions()) {
            generateNextQuestion(interview);
        } else {
            completeInterview(interview);
        }

        return modelMapper.toAnswerDTO(answer);
    }

    public QuestionDTO getNextQuestion(String userId, String interviewId) {
        log.info("Getting next question for interview: {}", interviewId);

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        if (!interview.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to interview");
        }

        List<Question> questions = questionRepository.findByInterviewIdOrderByQuestionNumberAsc(interviewId);
        List<Answer> answers = answerRepository.findByInterviewId(interviewId);

        if (questions.size() > answers.size()) {
            Question nextQuestion = questions.get(answers.size());
            return modelMapper.toQuestionDTO(nextQuestion);
        }

        throw new ResourceNotFoundException("No more questions available");
    }

    public InterviewDTO getCurrentInterview(String userId) {
        log.info("Getting current interview for user: {}", userId);

        Interview interview = interviewRepository
                .findFirstByUserIdAndStatusOrderByStartedAtDesc(userId, Interview.InterviewStatus.IN_PROGRESS)
                .orElseThrow(() -> new ResourceNotFoundException("No active interview found"));

        return modelMapper.toInterviewDTO(interview);
    }

    @Transactional
    public void endInterview(String userId, String interviewId) {
        log.info("Ending interview: {}", interviewId);

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        if (!interview.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to interview");
        }

        completeInterview(interview);
    }

    public Page<InterviewDTO> getInterviewHistory(String userId, Pageable pageable) {
        log.info("Getting interview history for user: {}", userId);

        return interviewRepository.findByUserId(userId, pageable)
                .map(modelMapper::toInterviewDTO);
    }

    public Map<String, Object> getInterviewDetails(String userId, String interviewId) {
        log.info("Getting interview details: {}", interviewId);

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        if (!interview.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to interview");
        }

        List<Question> questions = questionRepository.findByInterviewIdOrderByQuestionNumberAsc(interviewId);
        List<Answer> answers = answerRepository.findByInterviewId(interviewId);
        Feedback feedback = feedbackRepository.findFirstByInterviewId(interviewId).orElse(null);

        Map<String, Object> details = new HashMap<>();
        details.put("interview", modelMapper.toInterviewDTO(interview));
        details.put("questions", questions.stream().map(modelMapper::toQuestionDTO).collect(Collectors.toList()));
        details.put("answers", answers.stream().map(modelMapper::toAnswerDTO).collect(Collectors.toList()));
        details.put("feedback", feedback);

        return details;
    }

    private void generateNextQuestion(Interview interview) {
        log.info("Generating next question for interview: {}", interview.getId());

        int nextQuestionNumber = interview.getCompletedQuestions() + 1;

        Question question;
        if (interview.getDomain() == Interview.InterviewDomain.CODEFORCES) {
            question = codeforcesService.generateCodeforcesQuestion(
                    interview.getId(),
                    interview.getUserId(),
                    nextQuestionNumber,
                    interview.getDifficulty()
            );
        } else {
            List<String> questions = groqAIService.generateInterviewQuestions(
                    interview.getJobRole(),
                    interview.getDomain(),
                    interview.getDifficulty(),
                    1
            );

            if (questions.isEmpty()) {
                throw new BadRequestException("Failed to generate question");
            }

            question = Question.builder()
                    .interviewId(interview.getId())
                    .userId(interview.getUserId())
                    .questionNumber(nextQuestionNumber)
                    .questionText(questions.get(0))
                    .questionType("TECHNICAL")
                    .difficulty(interview.getDifficulty())
                    .build();
        }

        question = questionRepository.save(question);
        interview.getQuestionIds().add(question.getId());
        interviewRepository.save(interview);

        log.info("Question {} generated successfully", nextQuestionNumber);
    }

    @Transactional
    protected void completeInterview(Interview interview) {
        log.info("Completing interview: {}", interview.getId());

        // Check if already completed to prevent duplicate completion logic
        Interview latestInterview = interviewRepository.findById(interview.getId()).orElse(interview);
        if (latestInterview.getStatus() == Interview.InterviewStatus.COMPLETED) {
            log.info("Interview {} is already completed. Skipping completion logic.", interview.getId());
            return;
        }

        interview.setStatus(Interview.InterviewStatus.COMPLETED);
        interview.setCompletedAt(LocalDateTime.now());
        
        // Calculate duration
        Duration duration = Duration.between(interview.getStartedAt(), LocalDateTime.now());
        interview.setDurationMinutes(duration.toMinutes());

        // Generate overall feedback
        List<Question> questions = questionRepository.findByInterviewIdOrderByQuestionNumberAsc(interview.getId());
        List<Answer> answers = answerRepository.findByInterviewId(interview.getId());

        List<Map<String, Object>> qaList = new ArrayList<>();
        for (int i = 0; i < questions.size() && i < answers.size(); i++) {
            Map<String, Object> qa = new HashMap<>();
            qa.put("question", questions.get(i).getQuestionText());
            qa.put("answer", answers.get(i).getAnswerText());
            qa.put("score", answers.get(i).getScore());
            qaList.add(qa);
        }

        Map<String, Object> summary = groqAIService.generateInterviewSummary(qaList, interview.getDomain());

        // Calculate average score
        double avgScore = answers.stream()
                .mapToDouble(Answer::getScore)
                .average()
                .orElse(0.0);

        interview.setOverallScore(avgScore);
        interviewRepository.save(interview);

        // Save detailed feedback
        saveFeedback(interview, summary, answers);

        // Update progress
        updateProgress(interview.getUserId(), interview, avgScore);

        // Send notification
        notificationService.createNotification(
                interview.getUserId(),
                Notification.NotificationType.INTERVIEW_COMPLETED,
                "Interview Completed",
                String.format("Your interview for %s has been completed with a score of %.1f/10",
                        interview.getJobRole(), avgScore)
        );

        log.info("Interview completed successfully with average score: {}", avgScore);
    }

    @SuppressWarnings("unchecked")
    private void saveFeedback(Interview interview, Map<String, Object> summary, List<Answer> answers) {
        Feedback feedback = feedbackRepository.findFirstByInterviewId(interview.getId())
                .orElse(Feedback.builder()
                        .interviewId(interview.getId())
                        .userId(interview.getUserId())
                        .build());

        feedback.setOverallScore((Double) summary.get("overallScore"));
        feedback.setOverallSummary("Interview completed successfully");
        feedback.setStrengths((List<String>) summary.get("strengths"));
        feedback.setWeaknesses((List<String>) summary.get("weaknesses"));
        feedback.setRecommendations((List<String>) summary.get("recommendations"));

        feedbackRepository.save(feedback);
    }

    private void updateProgress(String userId, Interview interview, double score) {
        Progress progress = progressRepository.findByUserId(userId)
                .orElse(Progress.builder()
                        .userId(userId)
                        .totalInterviews(0)
                        .averageScore(0.0)
                        .highestScore(0.0)
                        .domainProgress(new HashMap<>())
                        .skillAnalytics(new HashMap<>())
                        .build());

        progress.setTotalInterviews(progress.getTotalInterviews() + 1);
        
        // Update average score
        double newAvg = ((progress.getAverageScore() * (progress.getTotalInterviews() - 1)) + score)
                / progress.getTotalInterviews();
        progress.setAverageScore(newAvg);

        // Update highest score
        if (score > progress.getHighestScore()) {
            progress.setHighestScore(score);
        }

        // Update domain progress
        String domain = interview.getDomain().name();
        Progress.DomainProgress domainProgress = progress.getDomainProgress()
                .getOrDefault(domain, Progress.DomainProgress.builder()
                        .interviewsCompleted(0)
                        .averageScore(0.0)
                        .build());

        int domainInterviews = domainProgress.getInterviewsCompleted() + 1;
        double domainAvg = ((domainProgress.getAverageScore() * domainProgress.getInterviewsCompleted()) + score)
                / domainInterviews;

        domainProgress.setInterviewsCompleted(domainInterviews);
        domainProgress.setAverageScore(domainAvg);
        domainProgress.setLastDifficulty(interview.getDifficulty());

        progress.getDomainProgress().put(domain, domainProgress);

        progressRepository.save(progress);
        log.info("Progress updated for user: {}", userId);
    }
}
