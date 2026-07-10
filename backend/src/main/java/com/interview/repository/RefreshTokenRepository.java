package com.interview.repository;

import com.interview.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for RefreshToken entity
 */
@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserId(String userId);

    void deleteByUserId(String userId);

    void deleteByToken(String token);
}
