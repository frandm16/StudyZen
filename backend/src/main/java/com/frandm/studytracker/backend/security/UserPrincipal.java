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
        throw new IllegalStateException("Unexpected principal type: " + principal.getClass());
    }
}
