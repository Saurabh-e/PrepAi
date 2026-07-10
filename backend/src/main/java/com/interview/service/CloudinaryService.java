package com.interview.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service for Cloudinary upload and delete operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Check if Cloudinary is fully configured with actual keys
     */
    public boolean isConfigured() {
        log.info("Checking Cloudinary configuration: cloudName='{}', apiKey='{}', apiSecret='{}'", 
                 cloudName, apiKey, apiSecret != null ? "[SET]" : "null");
        return cloudName != null && !cloudName.trim().isEmpty() && !cloudName.equals("test") &&
               apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("test") &&
               apiSecret != null && !apiSecret.trim().isEmpty() && !apiSecret.equals("test");
    }

    /**
     * Upload multipart file to Cloudinary
     */
    public Map uploadFile(MultipartFile file, String folder) throws IOException {
        log.info("Uploading file to Cloudinary folder '{}': {}", folder, file.getOriginalFilename());
        
        Map params = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto"
        );
        
        return cloudinary.uploader().upload(file.getBytes(), params);
    }

    /**
     * Delete file from Cloudinary by public ID
     */
    public void deleteFile(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            return;
        }
        
        try {
            log.info("Deleting file from Cloudinary: {}", publicId);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary: {}", publicId, e);
        }
    }
}
