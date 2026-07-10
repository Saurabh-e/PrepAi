package com.interview.service;

import com.interview.dto.DashboardDTO;
import com.interview.dto.InterviewDTO;
import com.interview.model.Interview;
import com.interview.model.Progress;
import com.interview.repository.InterviewRepository;
import com.interview.repository.ProgressRepository;
import com.interview.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for dashboard operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InterviewRepository interviewRepository;
    private final ProgressRepository progressRepository;
    private final ModelMapper modelMapper;

    public DashboardDTO getDashboard(String userId) {
        log.info("Getting dashboard for user: {}", userId);

        Progress progress = progressRepository.findByUserId(userId)
                .orElse(Progress.builder()
                        .userId(userId)
                        .totalInterviews(0)
                        .averageScore(0.0)
                        .highestScore(0.0)
                        .domainProgress(new HashMap<>())
                        .skillAnalytics(new HashMap<>())
                        .build());

        // Get recent interviews
        List<InterviewDTO> recentInterviews = interviewRepository
                .findByUserId(userId, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "startedAt")))
                .stream()
                .map(modelMapper::toInterviewDTO)
                .toList();

        // Calculate performance trend (last 30 days)
        Map<String, Double> performanceTrend = calculatePerformanceTrend(userId);

        // Identify weak and strong topics
        List<DashboardDTO.TopicStrength> weakTopics = identifyWeakTopics(progress);
        List<DashboardDTO.TopicStrength> strongTopics = identifyStrongTopics(progress);

        // Convert skill analytics
        Map<String, DashboardDTO.SkillScore> skillAnalytics = convertSkillAnalytics(progress);

        return DashboardDTO.builder()
                .totalInterviews(progress.getTotalInterviews())
                .averageScore(progress.getAverageScore())
                .highestScore(progress.getHighestScore())
                .recentInterviews(recentInterviews)
                .performanceTrend(performanceTrend)
                .weakTopics(weakTopics)
                .strongTopics(strongTopics)
                .skillAnalytics(skillAnalytics)
                .build();
    }

    private Map<String, Double> calculatePerformanceTrend(String userId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Interview> recentInterviews = interviewRepository
                .findByUserIdAndStatusAndStartedAtAfter(
                        userId, Interview.InterviewStatus.COMPLETED, thirtyDaysAgo);

        Map<String, List<Double>> scoresByWeek = new HashMap<>();
        
        for (Interview interview : recentInterviews) {
            if (interview.getOverallScore() != null) {
                String weekKey = getWeekKey(interview.getStartedAt());
                scoresByWeek.computeIfAbsent(weekKey, k -> new ArrayList<>())
                        .add(interview.getOverallScore());
            }
        }

        Map<String, Double> trend = new HashMap<>();
        for (Map.Entry<String, List<Double>> entry : scoresByWeek.entrySet()) {
            double avg = entry.getValue().stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);
            trend.put(entry.getKey(), avg);
        }

        return trend;
    }

    private List<DashboardDTO.TopicStrength> identifyWeakTopics(Progress progress) {
        return progress.getDomainProgress().entrySet().stream()
                .filter(entry -> entry.getValue().getAverageScore() < 6.0)
                .map(entry -> DashboardDTO.TopicStrength.builder()
                        .topic(entry.getKey())
                        .averageScore(entry.getValue().getAverageScore())
                        .timesAssessed(entry.getValue().getInterviewsCompleted())
                        .build())
                .sorted((a, b) -> Double.compare(a.getAverageScore(), b.getAverageScore()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<DashboardDTO.TopicStrength> identifyStrongTopics(Progress progress) {
        return progress.getDomainProgress().entrySet().stream()
                .filter(entry -> entry.getValue().getAverageScore() >= 7.0)
                .map(entry -> DashboardDTO.TopicStrength.builder()
                        .topic(entry.getKey())
                        .averageScore(entry.getValue().getAverageScore())
                        .timesAssessed(entry.getValue().getInterviewsCompleted())
                        .build())
                .sorted((a, b) -> Double.compare(b.getAverageScore(), a.getAverageScore()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private Map<String, DashboardDTO.SkillScore> convertSkillAnalytics(Progress progress) {
        Map<String, DashboardDTO.SkillScore> analytics = new HashMap<>();
        
        for (Map.Entry<String, Progress.SkillAnalytics> entry : progress.getSkillAnalytics().entrySet()) {
            DashboardDTO.SkillScore skillScore = DashboardDTO.SkillScore.builder()
                    .score(entry.getValue().getAverageScore())
                    .strength(entry.getValue().getStrength())
                    .build();
            analytics.put(entry.getKey(), skillScore);
        }

        return analytics;
    }

    private String getWeekKey(LocalDateTime dateTime) {
        int weekOfYear = dateTime.getDayOfYear() / 7;
        return "Week " + weekOfYear;
    }
}
