package com.frandm.studytracker.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notification-center")
public record NotificationCenterProperties(
        boolean enabled
) {}
