package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Deadline;
import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.model.UserSettings;
import com.frandm.studytracker.backend.repository.DeadlineRepository;
import com.frandm.studytracker.backend.repository.NotificationRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.repository.UserRepository;
import com.frandm.studytracker.backend.repository.UserSettingsRepository;
import com.frandm.studytracker.backend.util.DateTimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeadlineReminderService {

    private static final DateTimeFormatter DUE_DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private record Window(long hoursFrom, long hoursTo, String label) {}

    private static final List<Window> WINDOWS = List.of(
            new Window(6 * 24, 7 * 24, "7d"),
            new Window(2 * 24, 3 * 24, "3d"),
            new Window(0,      24,      "24h")
    );

    private final DeadlineRepository deadlineRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationRepository notificationRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;
    private final NotificationCenterClient notificationCenterClient;
    private final Clock clock;

    @Autowired
    public DeadlineReminderService(DeadlineRepository deadlineRepository,
                                   SubjectRepository subjectRepository,
                                   NotificationRepository notificationRepository,
                                   UserSettingsRepository userSettingsRepository,
                                   UserRepository userRepository,
                                   NotificationCenterClient notificationCenterClient) {
        this(deadlineRepository, subjectRepository, notificationRepository, userSettingsRepository, userRepository, notificationCenterClient, Clock.systemUTC());
    }

    DeadlineReminderService(DeadlineRepository deadlineRepository,
                            SubjectRepository subjectRepository,
                            NotificationRepository notificationRepository,
                            UserSettingsRepository userSettingsRepository,
                            NotificationCenterClient notificationCenterClient,
                            Clock clock) {
        this(deadlineRepository, subjectRepository, notificationRepository, userSettingsRepository, null, notificationCenterClient, clock);
    }

    DeadlineReminderService(DeadlineRepository deadlineRepository,
                            SubjectRepository subjectRepository,
                            NotificationRepository notificationRepository,
                            UserSettingsRepository userSettingsRepository,
                            UserRepository userRepository,
                            NotificationCenterClient notificationCenterClient,
                            Clock clock) {
        this.deadlineRepository = deadlineRepository;
        this.subjectRepository = subjectRepository;
        this.notificationRepository = notificationRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
        this.notificationCenterClient = notificationCenterClient;
        this.clock = clock;
    }

    private ZoneId getUserZone(UUID userId) {
        if (userRepository == null || userId == null) {
            return clock.getZone();
        }
        return userRepository.findById(userId)
                .map(User::getTimezone)
                .filter(tz -> tz != null && !tz.isBlank())
                .map(tz -> {
                    try {
                        return ZoneId.of(tz.trim());
                    } catch (Exception e) {
                        return clock.getZone();
                    }
                })
                .orElse(clock.getZone());
    }

    private String limit(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    private boolean isWindowEnabled(UserSettings settings, String label) {
        return switch (label) {
            case "7d"  -> Boolean.TRUE.equals(settings.getNotifyDeadline7d());
            case "3d"  -> Boolean.TRUE.equals(settings.getNotifyDeadline3d());
            case "24h" -> Boolean.TRUE.equals(settings.getNotifyDeadline24h());
            default    -> false;
        };
    }

    @Scheduled(cron = "0 0/30 * * * *", zone = "UTC")
    @Transactional
    public void createDueDeadlineReminders() {
        OffsetDateTime now = OffsetDateTime.now(clock);

        for (Window window : WINDOWS) {
            OffsetDateTime from = now.plusHours(window.hoursFrom());
            OffsetDateTime to   = now.plusHours(window.hoursTo());
            List<Deadline> candidates = deadlineRepository.findReminderCandidates(from, to);

            for (Deadline deadline : candidates) {
                UUID userId = deadline.getUserId();
                Optional<UserSettings> settingsOpt = userSettingsRepository.findById(userId);
                if (settingsOpt.isEmpty() || !isWindowEnabled(settingsOpt.get(), window.label())) {
                    continue;
                }

                ZoneId userZone = getUserZone(userId);
                LocalDate dueDate = deadline.getDueAt().toInstant().atZone(userZone).toLocalDate();
                String subjectContext = "";
                if (deadline.getSubjectId() != null) {
                    Subject subject = subjectRepository.findById(deadline.getSubjectId()).orElse(null);
                    if (subject != null) {
                        subjectContext = " for " + subject.getName();
                    }
                }

                String relativeDue = DateTimeUtils.formatRelativeDue(now, deadline.getDueAt(), deadline.isAllDay(), userZone);
                String formattedDueDate = DateTimeUtils.formatDueDate(deadline.getDueAt(), deadline.isAllDay(), userZone);

                String title = limit("Upcoming deadline: " + deadline.getTitle() + " (" + relativeDue + ")", 200);
                String body  = limit(deadline.getTitle() + subjectContext + ". Due date: " + formattedDueDate + " (" + relativeDue + ").", 2000);
                String reminderKey = "deadline:" + deadline.getId() + ":" + dueDate + ":" + window.label();

                int inserted = notificationRepository.insertReminder(userId, "warning", title, body, reminderKey);
                if (inserted > 0) {
                    notificationCenterClient.send(userId, title, body, "warning", reminderKey, "deadline" + window.label());
                }
            }
        }
    }
}
