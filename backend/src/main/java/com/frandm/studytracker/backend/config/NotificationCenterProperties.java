package com.frandm.studytracker.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notification-center")
public record NotificationCenterProperties(
        String url,
        String token,
        boolean enabled
) {}
