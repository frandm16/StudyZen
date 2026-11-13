package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Assessment;
import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.model.UserSettings;
import com.frandm.studytracker.backend.repository.AssessmentRepository;
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
public class ExamReminderService {

    private static final DateTimeFormatter DUE_DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private record Window(long hoursFrom, long hoursTo, String label) {}

    private static final List<Window> WINDOWS = List.of(
            new Window(6 * 24, 7 * 24, "7d"),
            new Window(2 * 24, 3 * 24, "3d"),
            new Window(0,      24,      "24h")
    );

    private final AssessmentRepository assessmentRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationRepository notificationRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final NotificationCenterClient notificationCenterClient;
    private final Clock clock;

    @Autowired
    public ExamReminderService(AssessmentRepository assessmentRepository,
                               SubjectRepository subjectRepository,
                               NotificationRepository notificationRepository,
                               UserSettingsRepository userSettingsRepository,
                               NotificationCenterClient notificationCenterClient) {
        this(assessmentRepository, subjectRepository, notificationRepository, userSettingsRepository, notificationCenterClient, Clock.systemUTC());
    }

    ExamReminderService(AssessmentRepository assessmentRepository,
                        SubjectRepository subjectRepository,
                        NotificationRepository notificationRepository,
                        UserSettingsRepository userSettingsRepository,
                        NotificationCenterClient notificationCenterClient,
                        Clock clock) {
        this.assessmentRepository = assessmentRepository;
        this.subjectRepository = subjectRepository;
        this.notificationRepository = notificationRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.notificationCenterClient = notificationCenterClient;
        this.clock = clock;
    }

    private String limit(String value, int maximumLength) {
        return value.length() <= maximumLength ? value : value.substring(0, maximumLength);
    }

    private boolean isWindowEnabled(UserSettings settings, String label) {
        return switch (label) {
            case "7d" -> Boolean.TRUE.equals(settings.getNotifyExam7d());
            case "3d" -> Boolean.TRUE.equals(settings.getNotifyExam3d());
            case "24h" -> Boolean.TRUE.equals(settings.getNotifyExam24h());
            default -> false;
        };
    }

    @Scheduled(cron = "0 0/30 * * * *", zone = "UTC")
    @Transactional
    public void createDueExamReminders() {
        OffsetDateTime now = OffsetDateTime.now(clock);

        for (Window window : WINDOWS) {
            OffsetDateTime from = now.plusHours(window.hoursFrom());
            OffsetDateTime to   = now.plusHours(window.hoursTo());
            List<Assessment> candidates = assessmentRepository.findReminderCandidatesInRange(from, to);

            for (Assessment assessment : candidates) {
                UUID userId = assessment.getUserId();
                Optional<UserSettings> settingsOpt = userSettingsRepository.findById(userId);
                if (settingsOpt.isEmpty() || !isWindowEnabled(settingsOpt.get(), window.label())) {
                    continue;
                }

                LocalDate dueDate = assessment.getDueAt().toInstant().atZone(clock.getZone()).toLocalDate();
                Subject subject = subjectRepository.findById(assessment.getSubjectId()).orElse(null);
                String subjectContext = subject == null ? "" : " for " + subject.getName();

                String title = limit("Upcoming exam: " + assessment.getTitle(), 200);
                String body  = limit(assessment.getTitle() + subjectContext + " is due on " + dueDate.format(DUE_DATE_FORMAT) + ".", 2000);
                String reminderKey = "exam:" + assessment.getId() + ":" + dueDate + ":" + window.label();

                notificationRepository.insertExamReminder(userId, title, body, reminderKey);
                notificationCenterClient.send(title, body, "warning", reminderKey);
            }
        }
    }
}
