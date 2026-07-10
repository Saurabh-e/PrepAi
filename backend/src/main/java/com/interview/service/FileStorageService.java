package com.interview.service;

import com.interview.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for local file storage operations
 */
@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    public String storeFile(MultipartFile file, String folder) {
        try {
            log.info("Storing file: {}", file.getOriginalFilename());
            
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            
            // Check for invalid characters
            if (originalFilename.contains("..")) {
                throw new BadRequestException("Filename contains invalid path sequence");
            }
            
            String fileExtension = getFileExtension(originalFilename);
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Copy file to the target location
            Path targetLocation = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Return URL path
            String fileUrl = "/api/v1/files/" + folder + "/" + newFilename;
            log.info("File stored successfully: {}", fileUrl);
            return fileUrl;
            
        } catch (IOException e) {
            log.error("Error storing file", e);
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    public void deleteFile(String filePath) {
        try {
            if (filePath == null || filePath.isEmpty()) {
                return;
            }
            
            log.info("Deleting file: {}", filePath);
            
            // Extract path from URL if needed
            String actualPath = filePath;
            if (filePath.startsWith("/api/v1/files/")) {
                actualPath = filePath.replace("/api/v1/files/", "");
            }
            
            Path path = Paths.get(uploadDir, actualPath);
            
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted successfully");
            }
        } catch (IOException e) {
            log.error("Error deleting file: {}", filePath, e);
        }
    }

    public Path getFilePath(String relativePath) {
        // Remove /api/v1/files/ prefix if present
        String actualPath = relativePath;
        if (relativePath.startsWith("/api/v1/files/")) {
            actualPath = relativePath.replace("/api/v1/files/", "");
        }
        return Paths.get(uploadDir, actualPath);
    }

    public String getFilePathFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        if (url.startsWith("/api/v1/files/")) {
            return url.replace("/api/v1/files/", "");
        }
        
        return url;
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex);
        }
        return "";
    }
}
