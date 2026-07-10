package com.interview;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "de.flapdoodle.mongodb.embedded.version=6.0.6",
        "spring.data.mongodb.uri=mongodb://localhost:27017/test_ai_interview",
        "jwt.secret=test-secret-key-for-testing-purposes-min-256-bits-long-key-value",
        "cloudinary.cloud.name=test",
        "cloudinary.api.key=test",
        "cloudinary.api.secret=test",
        "groq.api.key=test"
})
class AiInterviewPlatformApplicationTests {

    @Test
    void contextLoads() {
    }
}
