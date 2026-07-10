package com.interview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * User entity representing platform users
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String phone;

    private String profileImageUrl;

    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    private Experience experience;

    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    public enum Role {
        USER, ADMIN
    }

    public enum UserStatus {
        ACTIVE, SUSPENDED, DELETED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Experience {
        private String currentRole;
        private String company;
        private Integer yearsOfExperience;
        private String education;
    }
}
