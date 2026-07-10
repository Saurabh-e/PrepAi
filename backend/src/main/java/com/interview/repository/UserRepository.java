package com.interview.repository;

import com.interview.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByStatus(User.UserStatus status, Pageable pageable);

    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    long countByStatus(User.UserStatus status);
}
