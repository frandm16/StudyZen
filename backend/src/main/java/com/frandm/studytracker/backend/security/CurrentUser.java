package com.frandm.studytracker.backend.security;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class CurrentUser {

    private CurrentUser() {}

    public static UUID id() {
        return UserPrincipal.fromAuthentication(
                SecurityContextHolder.getContext().getAuthentication());
    }
}
