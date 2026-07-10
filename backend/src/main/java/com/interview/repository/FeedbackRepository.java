package com.interview.repository;

import com.interview.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Feedback entity
 */
@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    Optional<Feedback> findFirstByInterviewId(String interviewId);

    List<Feedback> findByUserId(String userId);
}
