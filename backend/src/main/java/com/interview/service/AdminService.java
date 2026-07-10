package com.interview.service;

import com.interview.dto.UserProfileDTO;
import com.interview.exception.BadRequestException;
import com.interview.exception.ResourceNotFoundException;
import com.interview.model.Interview;
import com.interview.model.User;
import com.interview.repository.InterviewRepository;
import com.interview.repository.UserRepository;
import com.interview.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for admin operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final ModelMapper modelMapper;

    public Page<UserProfileDTO> getAllUsers(Pageable pageable) {
        log.info("Getting all users");
        return userRepository.findAll(pageable)
                .map(modelMapper::toUserProfileDTO);
    }

    public Page<UserProfileDTO> searchUsers(String email, Pageable pageable) {
        log.info("Searching users by email: {}", email);
        return userRepository.findByEmailContainingIgnoreCase(email, pageable)
                .map(modelMapper::toUserProfileDTO);
    }

    public UserProfileDTO getUserById(String userId) {
        log.info("Getting user by ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return modelMapper.toUserProfileDTO(user);
    }

    @Transactional
    public void suspendUser(String userId) {
        log.info("Suspending user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRoles().contains(User.Role.ADMIN)) {
            throw new BadRequestException("Cannot suspend admin users");
        }

        user.setStatus(User.UserStatus.SUSPENDED);
        userRepository.save(user);
        log.info("User suspended successfully");
    }

    @Transactional
    public void activateUser(String userId) {
        log.info("Activating user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(user);
        log.info("User activated successfully");
    }

    @Transactional
    public void deleteUser(String userId) {
        log.info("Deleting user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRoles().contains(User.Role.ADMIN)) {
            throw new BadRequestException("Cannot delete admin users");
        }

        user.setStatus(User.UserStatus.DELETED);
        userRepository.save(user);
        log.info("User deleted successfully");
    }

    public Map<String, Object> getPlatformAnalytics() {
        log.info("Getting platform analytics");

        Map<String, Object> analytics = new HashMap<>();

        // User statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(User.UserStatus.ACTIVE);
        long suspendedUsers = userRepository.countByStatus(User.UserStatus.SUSPENDED);

        analytics.put("totalUsers", totalUsers);
        analytics.put("activeUsers", activeUsers);
        analytics.put("suspendedUsers", suspendedUsers);

        // Interview statistics
        long totalInterviews = interviewRepository.count();
        long completedInterviews = interviewRepository.countAll()
                .stream()
                .filter(interview -> interview.getStatus() == Interview.InterviewStatus.COMPLETED)
                .count();
        long inProgressInterviews = interviewRepository.countAll()
                .stream()
                .filter(interview -> interview.getStatus() == Interview.InterviewStatus.IN_PROGRESS)
                .count();

        analytics.put("totalInterviews", totalInterviews);
        analytics.put("completedInterviews", completedInterviews);
        analytics.put("inProgressInterviews", inProgressInterviews);

        // Calculate average score across all completed interviews
        double avgScore = interviewRepository.findAll().stream()
                .filter(interview -> interview.getStatus() == Interview.InterviewStatus.COMPLETED)
                .filter(interview -> interview.getOverallScore() != null)
                .mapToDouble(Interview::getOverallScore)
                .average()
                .orElse(0.0);

        analytics.put("platformAverageScore", avgScore);

        // Domain distribution
        Map<String, Long> domainDistribution = new HashMap<>();
        for (Interview.InterviewDomain domain : Interview.InterviewDomain.values()) {
            long count = interviewRepository.findAll().stream()
                    .filter(interview -> interview.getDomain() == domain)
                    .count();
            domainDistribution.put(domain.name(), count);
        }
        analytics.put("domainDistribution", domainDistribution);

        return analytics;
    }

    public Map<String, Object> getAIUsageStatistics() {
        log.info("Getting AI usage statistics");

        Map<String, Object> stats = new HashMap<>();

        // Total AI API calls (approximate: total questions + total answers)
        long totalInterviews = interviewRepository.count();
        long estimatedApiCalls = totalInterviews * 10; // Assuming avg 10 questions per interview

        stats.put("totalInterviews", totalInterviews);
        stats.put("estimatedApiCalls", estimatedApiCalls);

        // Average questions per interview
        double avgQuestionsPerInterview = interviewRepository.findAll().stream()
                .filter(interview -> interview.getTotalQuestions() != null)
                .mapToInt(Interview::getTotalQuestions)
                .average()
                .orElse(0.0);

        stats.put("avgQuestionsPerInterview", avgQuestionsPerInterview);

        // Most used difficulty level
        Map<String, Long> difficultyDistribution = new HashMap<>();
        for (Interview.Difficulty difficulty : Interview.Difficulty.values()) {
            long count = interviewRepository.findAll().stream()
                    .filter(interview -> interview.getDifficulty() == difficulty)
                    .count();
            difficultyDistribution.put(difficulty.name(), count);
        }
        stats.put("difficultyDistribution", difficultyDistribution);

        return stats;
    }
}
