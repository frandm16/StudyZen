package com.frandm.studytracker.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Base64;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimiter {
    private static final Duration LOGIN_WINDOW = Duration.ofMinutes(15);
    private static final Duration HOURLY_WINDOW = Duration.ofHours(1);
    private static final int LOGIN_EMAIL_LIMIT = 5;
    private static final int LOGIN_IP_LIMIT = 30;
    private static final int EMAIL_ACTION_LIMIT = 3;
    private static final int EMAIL_ACTION_IP_LIMIT = 10;
    private static final int REGISTRATION_IP_LIMIT = 5;
    private static final int TOKEN_ACTION_IP_LIMIT = 10;

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public void checkLogin(String email, HttpServletRequest request) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
        check("login:email:" + digest(normalizedEmail), LOGIN_EMAIL_LIMIT, LOGIN_WINDOW);
        check("login:ip:" + clientIp(request), LOGIN_IP_LIMIT, LOGIN_WINDOW);
    }

    public void loginSucceeded(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
        windows.remove("login:email:" + digest(normalizedEmail));
    }

    public void checkEmailAction(String action, String email, HttpServletRequest request) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
        check(action + ":email:" + digest(normalizedEmail), EMAIL_ACTION_LIMIT, HOURLY_WINDOW);
        check(action + ":ip:" + clientIp(request), EMAIL_ACTION_IP_LIMIT, HOURLY_WINDOW);
    }

    public void checkRegistration(HttpServletRequest request) {
        check("register:ip:" + clientIp(request), REGISTRATION_IP_LIMIT, HOURLY_WINDOW);
    }

    public void checkTokenAction(String action, HttpServletRequest request) {
        check(action + ":ip:" + clientIp(request), TOKEN_ACTION_IP_LIMIT, HOURLY_WINDOW);
    }

    private void check(String key, int limit, Duration duration) {
        long now = System.nanoTime();
        long windowNanos = duration.toNanos();
        Window window = windows.computeIfAbsent(key, ignored -> new Window(windowNanos));
        long retryNanos;
        synchronized (window) {
            while (!window.attempts.isEmpty() && now - window.attempts.peekFirst() >= windowNanos) {
                window.attempts.removeFirst();
            }
            if (window.attempts.size() >= limit) {
                retryNanos = windowNanos - (now - window.attempts.peekFirst());
            } else {
                window.attempts.addLast(now);
                cleanup(now);
                return;
            }
        }
        long retrySeconds = Math.max(1, (retryNanos + 999_999_999L) / 1_000_000_000L);
        throw new RateLimitExceededException(retrySeconds);
    }

    private void cleanup(long now) {
        if (windows.size() < 10_000) {
            return;
        }
        Iterator<Map.Entry<String, Window>> iterator = windows.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Window> entry = iterator.next();
            Window window = entry.getValue();
            synchronized (window) {
                while (!window.attempts.isEmpty() && now - window.attempts.peekFirst() >= window.durationNanos) {
                    window.attempts.removeFirst();
                }
                if (window.attempts.isEmpty()) {
                    iterator.remove();
                }
            }
        }
    }

    private String clientIp(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ip == null || ip.isBlank() ? "unknown" : ip;
    }

    private String digest(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static final class Window {
        private final ArrayDeque<Long> attempts = new ArrayDeque<>();
        private final long durationNanos;

        private Window(long durationNanos) {
            this.durationNanos = durationNanos;
        }
    }

    public static final class RateLimitExceededException extends ResponseStatusException {
        private final long retryAfterSeconds;

        public RateLimitExceededException(long retryAfterSeconds) {
            super(HttpStatus.TOO_MANY_REQUESTS, "Too many authentication attempts. Try again later.");
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public long getRetryAfterSeconds() {
            return retryAfterSeconds;
        }
    }
}
