package com.interview.util;

import com.interview.exception.UnauthorizedException;
import com.interview.model.User;
import com.interview.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utility class for security-related operations
 */
@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    @Autowired
    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        return authentication.getName();
    }

    public String getCurrentUserId() {
        String username = getCurrentUsername();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return user.getId();
    }

    public User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
