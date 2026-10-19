package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Assessment;
import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.repository.AssessmentRepository;
import com.frandm.studytracker.backend.repository.NotificationRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExamReminderService {

    private static final DateTimeFormatter DUE_DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
    private final AssessmentRepository assessmentRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationRepository notificationRepository;
    private final Clock clock;

    public ExamReminderService(AssessmentRepository assessmentRepository,
                               SubjectRepository subjectRepository,
                               NotificationRepository notificationRepository) {
        this(assessmentRepository, subjectRepository, notificationRepository, Clock.systemUTC());
    }

    ExamReminderService(AssessmentRepository assessmentRepository,
                        SubjectRepository subjectRepository,
                        NotificationRepository notificationRepository,
                        Clock clock) {
        this.assessmentRepository = assessmentRepository;
        this.subjectRepository = subjectRepository;
        this.notificationRepository = notificationRepository;
        this.clock = clock;
    }

    private String limit(String value, int maximumLength) {
        return value.length() <= maximumLength ? value : value.substring(0, maximumLength);
    }

    @Scheduled(cron = "0 15 0 * * *", zone = "UTC")
    @Transactional
    public void createDueExamReminders() {
        LocalDate today = LocalDate.now(clock);
        List<Assessment> candidates = assessmentRepository.findReminderCandidates(today.plusDays(1), today.plusDays(7));
        for (Assessment assessment : candidates) {
            LocalDate dueDate = assessment.getDueAt().toInstant().atZone(clock.getZone()).toLocalDate();
            Subject subject = subjectRepository.findById(assessment.getSubjectId()).orElse(null);
            String subjectContext = subject == null ? "" : " for " + subject.getName();
            String title = limit("Upcoming exam: " + assessment.getTitle(), 200);
            String body = limit(assessment.getTitle() + subjectContext + " is due on " + dueDate.format(DUE_DATE_FORMAT) + ".", 2000);
            String reminderKey = "exam:" + assessment.getId() + ":" + dueDate;
            notificationRepository.insertExamReminder(assessment.getUserId(), title, body, reminderKey);
        }
    }
}
