package com.interview.repository;

import com.interview.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Question entity
 */
@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {

    List<Question> findByInterviewIdOrderByQuestionNumberAsc(String interviewId);

    List<Question> findByUserId(String userId);

    long countByInterviewId(String interviewId);
}
