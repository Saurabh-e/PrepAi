package com.interview.repository;

import com.interview.model.Answer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Answer entity
 */
@Repository
public interface AnswerRepository extends MongoRepository<Answer, String> {

    List<Answer> findByInterviewId(String interviewId);

    Optional<Answer> findByQuestionId(String questionId);

    List<Answer> findByUserId(String userId);

    long countByInterviewId(String interviewId);

    boolean existsByQuestionId(String questionId);
}
