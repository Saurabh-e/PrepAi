package com.interview.dto;

import com.interview.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * DTO for user profile
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {

    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String profileImageUrl;
    private Set<String> roles;
    private List<String> skills;
    private User.Experience experience;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
