package com.interview;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Main application class for AI Interview Preparation Platform
 * 
 * @author Senior Java Developer
 * @version 1.0.0
 */
@SpringBootApplication
@EnableMongoAuditing
public class AiInterviewPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiInterviewPlatformApplication.class, args);
    }
}
