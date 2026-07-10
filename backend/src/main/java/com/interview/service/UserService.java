package com.interview.service;

import com.interview.dto.ChangePasswordRequest;
import com.interview.dto.UpdateProfileRequest;
import com.interview.dto.UserProfileDTO;
import com.interview.exception.BadRequestException;
import com.interview.exception.ResourceNotFoundException;
import com.interview.model.User;
import com.interview.repository.UserRepository;
import com.interview.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for user management operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final ModelMapper modelMapper;

    public UserProfileDTO getUserProfile(String userId) {
        log.info("Getting user profile for user: {}", userId);
        User user = findUserById(userId);
        return modelMapper.toUserProfileDTO(user);
    }

    @Transactional
    public UserProfileDTO updateProfile(String userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);
        
        User user = findUserById(userId);
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }
        if (request.getExperience() != null) {
            user.setExperience(request.getExperience());
        }
        
        user = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", userId);
        
        return modelMapper.toUserProfileDTO(user);
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", userId);
        
        User user = findUserById(userId);
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", userId);
    }

    @Transactional
    public UserProfileDTO uploadProfileImage(String userId, MultipartFile file) {
        log.info("Uploading profile image for user: {}", userId);
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }
        
        User user = findUserById(userId);
        
        // Delete old image if exists
        if (user.getProfileImageUrl() != null) {
            String oldFilePath = fileStorageService.getFilePathFromUrl(user.getProfileImageUrl());
            fileStorageService.deleteFile(oldFilePath);
        }
        
        // Upload new image
        String imagePath = fileStorageService.storeFile(file, "profile-images");
        
        // Store URL format for frontend access
        String imageUrl = "/api/v1/files/profile-images/" + extractFileName(imagePath);
        user.setProfileImageUrl(imageUrl);
        
        user = userRepository.save(user);
        log.info("Profile image uploaded successfully for user: {}", userId);
        
        return modelMapper.toUserProfileDTO(user);
    }
    
    private String extractFileName(String path) {
        if (path == null) return "";
        String[] parts = path.split("/");
        return parts[parts.length - 1];
    }

    @Transactional
    public void addSkill(String userId, String skill) {
        log.info("Adding skill '{}' for user: {}", skill, userId);
        
        User user = findUserById(userId);
        
        if (!user.getSkills().contains(skill)) {
            user.getSkills().add(skill);
            userRepository.save(user);
            log.info("Skill added successfully");
        }
    }

    @Transactional
    public void removeSkill(String userId, String skill) {
        log.info("Removing skill '{}' for user: {}", skill, userId);
        
        User user = findUserById(userId);
        user.getSkills().remove(skill);
        userRepository.save(user);
        
        log.info("Skill removed successfully");
    }

    private User findUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
