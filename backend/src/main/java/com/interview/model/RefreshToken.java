package com.interview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

/**
 * Refresh Token entity for JWT token refresh mechanism
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "refresh_tokens")
public class RefreshToken {

    @Id
    private String id;

    @Indexed(unique = true)
    private String token;

    private String userId;

    @Indexed(expireAfterSeconds = 0)
    private Instant expiryDate;

    private Instant createdAt;

    public boolean isExpired() {
        return Instant.now().isAfter(this.expiryDate);
    }
}
