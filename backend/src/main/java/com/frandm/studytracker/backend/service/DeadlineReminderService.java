package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Deadline;
import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.model.UserSettings;
import com.frandm.studytracker.backend.repository.DeadlineRepository;
import com.frandm.studytracker.backend.repository.NotificationRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
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
    private final Clock clock;

    @Autowired
    public DeadlineReminderService(DeadlineRepository deadlineRepository,
                                   SubjectRepository subjectRepository,
                                   NotificationRepository notificationRepository,
                                   UserSettingsRepository userSettingsRepository) {
        this(deadlineRepository, subjectRepository, notificationRepository, userSettingsRepository, Clock.systemUTC());
    }

    DeadlineReminderService(DeadlineRepository deadlineRepository,
                            SubjectRepository subjectRepository,
                            NotificationRepository notificationRepository,
                            UserSettingsRepository userSettingsRepository,
                            Clock clock) {
        this.deadlineRepository = deadlineRepository;
        this.subjectRepository = subjectRepository;
        this.notificationRepository = notificationRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.clock = clock;
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

                LocalDate dueDate = deadline.getDueAt().toInstant().atZone(clock.getZone()).toLocalDate();
                String subjectContext = "";
                if (deadline.getSubjectId() != null) {
                    Subject subject = subjectRepository.findById(deadline.getSubjectId()).orElse(null);
                    if (subject != null) {
                        subjectContext = " for " + subject.getName();
                    }
                }

                String title = limit("Upcoming deadline: " + deadline.getTitle(), 200);
                String body  = limit(deadline.getTitle() + subjectContext + " is due on " + dueDate.format(DUE_DATE_FORMAT) + ".", 2000);
                String reminderKey = "deadline:" + deadline.getId() + ":" + dueDate + ":" + window.label();

                notificationRepository.insertReminder(userId, "warning", title, body, reminderKey);
            }
        }
    }
}
