package com.frandm.studytracker.backend.dto.auth;

import com.frandm.studytracker.backend.model.User;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AuthenticatedUserResponse(
        UUID id,
        String email,
        String displayName,
        String username,
        String bio,
        String avatarUrl,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        boolean hasPassword
) {
    public static AuthenticatedUserResponse from(User user) {
        return new AuthenticatedUserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getUsername(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getPasswordHash() != null
        );
    }
}
