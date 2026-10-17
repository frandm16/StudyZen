package com.frandm.studytracker.backend.dto.notification;

import com.frandm.studytracker.backend.model.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NotificationCreateRequest(
        @NotNull NotificationType type,
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 2000) String body
) {
}
