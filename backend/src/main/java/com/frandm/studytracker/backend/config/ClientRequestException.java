package com.frandm.studytracker.backend.config;

import org.springframework.http.HttpStatus;

public class ClientRequestException extends RuntimeException {
    private final HttpStatus status;

    public ClientRequestException(String message) {
        this(message, HttpStatus.BAD_REQUEST);
    }

    public ClientRequestException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
