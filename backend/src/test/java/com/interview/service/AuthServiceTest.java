package com.interview.service;

import com.interview.dto.AuthRequest;
import com.interview.dto.AuthResponse;
import com.interview.dto.RegisterRequest;
import com.interview.exception.BadRequestException;
import com.interview.model.RefreshToken;
import com.interview.model.User;
import com.interview.repository.UserRepository;
import com.interview.security.JwtUtil;
import com.interview.util.ModelMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private AuthRequest authRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        authRequest = AuthRequest.builder()
                .email("john@example.com")
                .password("password123")
                .build();

        user = User.builder()
                .id("123")
                .email("john@example.com")
                .password("encoded-password")
                .firstName("John")
                .lastName("Doe")
                .build();

        org.springframework.test.util.ReflectionTestUtils.setField(authService, "jwtExpiration", 86400000L);
    }

    @Test
    void testRegister_Success() {
        RefreshToken refreshToken = RefreshToken.builder()
                .token("refresh-token")
                .userId("123")
                .build();
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(refreshToken);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken(anyString(), any())).thenReturn("jwt-token");
        when(modelMapper.toUserDTO(any(User.class))).thenReturn(new AuthResponse.UserDTO());

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegister_EmailExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        RefreshToken refreshToken = RefreshToken.builder()
                .token("refresh-token")
                .userId("123")
                .build();
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(refreshToken);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(anyString(), any())).thenReturn("jwt-token");
        when(modelMapper.toUserDTO(any(User.class))).thenReturn(new AuthResponse.UserDTO());

        AuthResponse response = authService.login(authRequest);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        verify(userRepository, times(1)).save(any(User.class));
    }
}
