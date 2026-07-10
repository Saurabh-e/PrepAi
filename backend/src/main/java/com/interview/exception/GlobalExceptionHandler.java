package com.interview.exception;

import com.interview.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for centralized error handling
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        
        ApiResponse.ErrorDetails errorDetails = ApiResponse.ErrorDetails.builder()
                .code("RESOURCE_NOT_FOUND")
                .details(ex.getMessage())
                .build();

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Resource not found", errorDetails));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(BadRequestException ex) {
        log.error("Bad request: {}", ex.getMessage());
        
        ApiResponse.ErrorDetails errorDetails = ApiResponse.ErrorDetails.builder()
                .code("BAD_REQUEST")
                .details(ex.getMessage())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Bad request", errorDetails));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorized(UnauthorizedException ex) {
        log.error("Unauthorized: {}", ex.getMessage());
        
        ApiResponse.ErrorDetails errorDetails = ApiResponse.ErrorDetails.builder()
                .code("UNAUTHORIZED")
                .details(ex.getMessage())
                .build();

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Unauthorized access", errorDetails));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(BadCredentialsException ex) {
        log.error("Bad credentials: {}", ex.getMessage());
        
        ApiResponse.ErrorDetails errorDetails = ApiResponse.ErrorDetails.builder()
                .code("INVALID_CREDENTIALS")
                .details("Invalid email or password")
                .build();

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Authentication failed", errorDetails));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        log.error("Access denied: {}", ex.getMessage());
        
        ApiResponse.ErrorDetails errorDetails = ApiResponse.ErrorDetails.builder()
                .code("ACCESS_DENIED")
                .details("You don't have permission to access this resource")
                .build();

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied", errorDetails));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        log.error("Validation errors: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponse.ErrorDetails errorDetails = ApiResponse.ErrorDetails.builder()
                .code("VALIDATION_ERROR")
                .details("Invalid input data")
                .validationErrors(errors)
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errorDetails));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        log.error("File size exceeded: {}", ex.getMessage());
        
        ApiResponse.ErrorDetails errorDetails = ApiResponse.ErrorDetails.builder()
                .code("FILE_SIZE_EXCEEDED")
                .details("File size exceeds maximum allowed size of 10MB")
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("File upload failed", errorDetails));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(Exception ex) {
        log.error("Unexpected error: ", ex);
        
        ApiResponse.ErrorDetails errorDetails = ApiResponse.ErrorDetails.builder()
                .code("INTERNAL_SERVER_ERROR")
                .details("An unexpected error occurred. Please try again later.")
                .build();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error", errorDetails));
    }
}
