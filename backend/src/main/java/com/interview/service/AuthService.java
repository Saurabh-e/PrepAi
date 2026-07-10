package com.interview.service;

import com.interview.dto.AuthRequest;
import com.interview.dto.AuthResponse;
import com.interview.dto.RegisterRequest;
import com.interview.exception.BadRequestException;
import com.interview.exception.UnauthorizedException;
import com.interview.model.RefreshToken;
import com.interview.model.User;
import com.interview.repository.UserRepository;
import com.interview.security.JwtUtil;
import com.interview.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Service for authentication operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final ModelMapper modelMapper;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .roles(getDefaultRoles())
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getId());

        String accessToken = jwtUtil.generateToken(user.getEmail(), null);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return buildAuthResponse(user, accessToken, refreshToken.getToken());
    }

    public AuthResponse login(AuthRequest request) {
        log.info("User login attempt: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtUtil.generateToken(user.getEmail(), null);
        
        // Delete old refresh token and create new one
        refreshTokenService.deleteByUserId(user.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        log.info("User logged in successfully: {}", user.getId());
        return buildAuthResponse(user, accessToken, refreshToken.getToken());
    }

    public AuthResponse refreshToken(String refreshTokenStr) {
        log.info("Refreshing access token");

        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenStr);
        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String newAccessToken = jwtUtil.generateToken(user.getEmail(), null);

        log.info("Access token refreshed for user: {}", user.getId());
        return buildAuthResponse(user, newAccessToken, refreshTokenStr);
    }

    @Transactional
    public void logout(String userId) {
        log.info("User logout: {}", userId);
        refreshTokenService.deleteByUserId(userId);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .user(modelMapper.toUserDTO(user))
                .build();
    }

    private Set<User.Role> getDefaultRoles() {
        Set<User.Role> roles = new HashSet<>();
        roles.add(User.Role.USER);
        return roles;
    }
}
