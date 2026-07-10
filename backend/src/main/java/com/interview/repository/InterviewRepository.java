package com.interview.repository;

import com.interview.model.Interview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Interview entity
 */
@Repository
public interface InterviewRepository extends MongoRepository<Interview, String> {

    List<Interview> findByUserIdAndStatus(String userId, Interview.InterviewStatus status);

    Page<Interview> findByUserId(String userId, Pageable pageable);

    Page<Interview> findByUserIdAndStatus(String userId, Interview.InterviewStatus status, Pageable pageable);

    long countByUserId(String userId);

    long countByUserIdAndStatus(String userId, Interview.InterviewStatus status);

    Optional<Interview> findFirstByUserIdAndStatusOrderByStartedAtDesc(
            String userId, Interview.InterviewStatus status);

    List<Interview> findByUserIdAndStatusAndStartedAtAfter(
            String userId, Interview.InterviewStatus status, LocalDateTime startedAt);

    default List<Interview> countAll() {
        return findAll();
    }
}
