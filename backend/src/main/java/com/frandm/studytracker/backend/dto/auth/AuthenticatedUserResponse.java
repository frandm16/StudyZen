package com.frandm.studytracker.backend.dto.auth;

import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.model.enums.AuthProvider;
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
        boolean hasPassword,
        boolean hasGoogleIdentity
) {
    public static AuthenticatedUserResponse from(User user, boolean hasGoogleIdentity) {
        return new AuthenticatedUserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getUsername(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getPasswordHash() != null,
                hasGoogleIdentity
        );
    }
}
