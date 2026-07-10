package com.interview.controller;

import com.interview.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * REST controller for file serving
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File Serving API")
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/profile-images/{filename:.+}")
    @Operation(summary = "Get profile image")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) {
        try {
            Path filePath = fileStorageService.getFilePath("profile-images/" + filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "image/jpeg";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error loading profile image: {}", filename, e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/resumes/{filename:.+}")
    @Operation(summary = "Get resume file")
    public ResponseEntity<Resource> getResume(@PathVariable String filename) {
        try {
            Path filePath = fileStorageService.getFilePath("resumes/" + filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error loading resume: {}", filename, e);
            return ResponseEntity.notFound().build();
        }
    }
}
