package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.config.NotificationCenterProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PreDestroy;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import com.frandm.studytracker.backend.repository.UserSettingsRepository;

@Service
public class NotificationCenterClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationCenterClient.class);

    private final NotificationCenterProperties props;
    private final UserSettingsRepository userSettingsRepository;
    private final RestClient restClient;
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    public NotificationCenterClient(NotificationCenterProperties props,
                                    UserSettingsRepository userSettingsRepository) {
        this.props = props;
        this.userSettingsRepository = userSettingsRepository;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    public void send(UUID userId, String title, String body, String level, String dedupKey) {
        send(userId, title, body, level, dedupKey, true);
    }

    public void send(UUID userId, String title, String body, String level, String dedupKey, String event) {
        var settings = userId == null ? null : userSettingsRepository.findById(userId).orElse(null);
        boolean eventEnabled = settings != null && switch (event) {
            case "exam7d" -> Boolean.TRUE.equals(settings.getNotifyCenterExam7d());
            case "exam3d" -> Boolean.TRUE.equals(settings.getNotifyCenterExam3d());
            case "exam24h" -> Boolean.TRUE.equals(settings.getNotifyCenterExam24h());
            case "deadline7d" -> Boolean.TRUE.equals(settings.getNotifyCenterDeadline7d());
            case "deadline3d" -> Boolean.TRUE.equals(settings.getNotifyCenterDeadline3d());
            case "deadline24h" -> Boolean.TRUE.equals(settings.getNotifyCenterDeadline24h());
            case "deadlineCompleted" -> Boolean.TRUE.equals(settings.getNotifyCenterDeadlineCompleted());
            case "sessionLogged" -> Boolean.TRUE.equals(settings.getNotifyCenterSessionLogged());
            case "topicMastered" -> Boolean.TRUE.equals(settings.getNotifyCenterTopicMastered());
            case "goalReached" -> Boolean.TRUE.equals(settings.getNotifyCenterGoalReached());
            case "goal80pct" -> Boolean.TRUE.equals(settings.getNotifyCenterGoal80pct());
            default -> false;
        };
        send(userId, title, body, level, dedupKey, eventEnabled);
    }

    public void send(UUID userId, String title, String body, String level, String dedupKey, boolean eventEnabled) {
        if (!props.enabled() || !eventEnabled || userId == null) return;
        var settings = userSettingsRepository.findById(userId).orElse(null);
        if (settings == null || !Boolean.TRUE.equals(settings.getNotificationCenterEnabled())) return;
        String url = settings.getNotificationCenterUrl();
        String token = settings.getNotificationCenterToken();
        if (url == null || url.isBlank() || token == null || token.isBlank()) return;

        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("body", body);
        payload.put("level", level.toUpperCase(Locale.ROOT));
        if (dedupKey != null) {
            payload.put("dedupKey", dedupKey);
        }

        executor.execute(() -> {
            try {
                restClient.post()
                        .uri(buildNotificationsUri(url))
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .toBodilessEntity();
            } catch (Exception e) {
                log.error("NotificationCenter request failed: {}", e.getMessage());
            }
        });
    }

    private String buildNotificationsUri(String configuredUrl) {
        String baseUrl = configuredUrl.replaceAll("/+$", "");
        if (baseUrl.endsWith("/api/v1")) {
            return baseUrl + "/notifications";
        }
        return baseUrl + "/api/v1/notifications";
    }

    @PreDestroy
    void shutdown() {
        executor.shutdown();
    }
}
