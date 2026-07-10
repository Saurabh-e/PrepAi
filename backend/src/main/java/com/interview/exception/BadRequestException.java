package com.interview.exception;

/**
 * Exception thrown for bad client requests
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
