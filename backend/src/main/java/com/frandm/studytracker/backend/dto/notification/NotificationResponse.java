package com.frandm.studytracker.backend.dto.notification;

import com.frandm.studytracker.backend.model.Notification;
import com.frandm.studytracker.backend.model.enums.NotificationType;
import java.time.OffsetDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String body,
        boolean read,
        OffsetDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getBody(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
