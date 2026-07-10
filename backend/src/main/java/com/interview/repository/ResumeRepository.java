package com.interview.repository;

import com.interview.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Resume entity
 */
@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {

    List<Resume> findByUserId(String userId);

    Optional<Resume> findFirstByUserIdOrderByUploadedAtDesc(String userId);

    void deleteByUserId(String userId);
}
