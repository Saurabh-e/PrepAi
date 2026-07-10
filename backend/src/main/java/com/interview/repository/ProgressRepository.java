package com.interview.repository;

import com.interview.model.Progress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Progress entity
 */
@Repository
public interface ProgressRepository extends MongoRepository<Progress, String> {

    Optional<Progress> findByUserId(String userId);
}
