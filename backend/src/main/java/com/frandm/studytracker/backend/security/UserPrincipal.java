package com.frandm.studytracker.backend.security;

import java.util.UUID;

/**
 * Utility to extract the authenticated user's UUID from the Spring Security context.
 */
public record UserPrincipal(UUID userId) {

    public static UUID fromAuthentication(
            org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user in context");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UUID uuid) {
            return uuid;
        }
        if (principal instanceof String value) {
            try {
                return UUID.fromString(value);
            } catch (IllegalArgumentException ignored) {
                throw new IllegalStateException("Authenticated principal is not a valid UUID");
            }
        }
        throw new IllegalStateException("Unexpected principal type: " + (principal == null ? "null" : principal.getClass()));
    }
}
