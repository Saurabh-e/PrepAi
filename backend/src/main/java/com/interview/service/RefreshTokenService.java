package com.interview.service;

import com.interview.exception.UnauthorizedException;
import com.interview.model.RefreshToken;
import com.interview.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Service for refresh token operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenExpiration;

    @Transactional
    public RefreshToken createRefreshToken(String userId) {
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
                .createdAt(Instant.now())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired");
        }

        return refreshToken;
    }

    @Transactional
    public void deleteByUserId(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }
}
