package com.frandm.studytracker.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.BindException;

import jakarta.validation.ConstraintViolationException;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(com.frandm.studytracker.backend.security.AuthRateLimiter.RateLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimit(
            com.frandm.studytracker.backend.security.AuthRateLimiter.RateLimitExceededException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        body.put("error", HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase());
        body.put("message", "Too many authentication attempts. Try again later.");
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, Long.toString(ex.getRetryAfterSeconds()))
                .body(body);
    }

    @ExceptionHandler(ClientRequestException.class)
    public ResponseEntity<Map<String, Object>> handleClientRequest(ClientRequestException ex) {
        return buildResponse(ex.getStatus(), ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        logger.error("Unexpected illegal argument", ex);
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid request");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        if (ex.getMessage() != null && ex.getMessage().contains("authenticated user")) {
            return buildResponse(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        logger.error("Unexpected illegal state", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNoSuchElement(NoSuchElementException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Resource not found");
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class, ConstraintViolationException.class})
    public ResponseEntity<Map<String, Object>> handleValidationException(Exception ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedRequest(HttpMessageNotReadableException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Malformed request body");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        logger.error("Unhandled runtime exception", ex);
        String message = ex.getMessage();
        if (message != null && (message.startsWith("Topic not found") || message.startsWith("Subject not found")
                || message.startsWith("AcademicTerm not found") || message.startsWith("StudySession not found")
                || message.startsWith("ScheduledSession not found") || message.startsWith("StudyGoal not found")
                || message.startsWith("Deadline not found") || message.startsWith("TodoItem not found")
                || message.startsWith("Assessment not found"))) {
            return buildResponse(HttpStatus.NOT_FOUND, "Resource not found");
        }
        if (message != null && (message.startsWith("Topic already exists") || message.startsWith("Subject already exists"))) {
            return buildResponse(HttpStatus.CONFLICT, "A resource with these details already exists");
        }
        if (isKnownClientValidationMessage(message)) {
            return buildResponse(HttpStatus.BAD_REQUEST, message);
        }
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }

    private boolean isKnownClientValidationMessage(String message) {
        return message != null && (message.equals("Deadline title is required")
                || message.equals("TodoItem text is required")
                || message.equals("A topic deadline requires a subject")
                || message.equals("A topic todo requires a subject")
                || message.equals("totalMinutes must be > 0")
                || message.equals("focusRating must be between 0 and 5")
                || message.equals("startedAt is required")
                || message.equals("endedAt is required")
                || message.equals("startsAt is required")
                || message.equals("endsAt is required")
                || message.startsWith("Total weight for subject cannot exceed 100%"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        logger.error("Unhandled exception", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}