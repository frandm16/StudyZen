package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.UserSettings;
import com.frandm.studytracker.backend.repository.NotificationRepository;
import com.frandm.studytracker.backend.repository.StudySessionRepository;
import com.frandm.studytracker.backend.repository.StudyGoalRepository;
import com.frandm.studytracker.backend.repository.TopicRepository;
import com.frandm.studytracker.backend.repository.UserSettingsRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.model.StudyGoal;
import com.frandm.studytracker.backend.model.enums.GoalPeriod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.temporal.IsoFields;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class NotificationEventService {

    private final NotificationRepository notificationRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final StudySessionRepository studySessionRepository;
    private final StudyGoalRepository studyGoalRepository;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationCenterClient notificationCenterClient;

    public NotificationEventService(NotificationRepository notificationRepository,
                                    UserSettingsRepository userSettingsRepository,
                                    StudySessionRepository studySessionRepository,
                                    StudyGoalRepository studyGoalRepository,
                                    TopicRepository topicRepository,
                                    SubjectRepository subjectRepository,
                                    NotificationCenterClient notificationCenterClient) {
        this.notificationRepository = notificationRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.studySessionRepository = studySessionRepository;
        this.studyGoalRepository = studyGoalRepository;
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
        this.notificationCenterClient = notificationCenterClient;
    }

    private Optional<UserSettings> settings(UUID userId) {
        return userSettingsRepository.findById(userId);
    }

    private String limit(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    public void onDeadlineCompleted(UUID userId, String deadlineTitle) {
        settings(userId).ifPresent(s -> {
            String title = limit("Deadline completed: " + deadlineTitle, 200);
            String body = limit("You completed the deadline \"" + deadlineTitle + "\". Your task is now marked as finished in StudyZen.", 2000);
            if (Boolean.TRUE.equals(s.getNotifyDeadlineCompleted())) {
                notificationRepository.insertReminder(userId, "success", title, body, null);
            }
            notificationCenterClient.send(userId, title, body, "success", null, "deadlineCompleted");
        });
    }

    public void onTopicMastered(UUID userId, String topicName) {
        settings(userId).ifPresent(s -> {
            String title = limit("Topic mastered: " + topicName, 200);
            String body = limit("You marked \"" + topicName + "\" as mastered. Keep it up!", 2000);
            if (Boolean.TRUE.equals(s.getNotifyTopicMastered())) {
                notificationRepository.insertReminder(userId, "success", title, body, null);
            }
            notificationCenterClient.send(userId, title, body, "success", null, "topicMastered");
        });
    }

    public void onSessionLogged(UUID userId, int totalMinutes, Long topicId) {
        settings(userId).ifPresent(s -> {
            String topicName = topicId == null ? null : topicRepository.findById(topicId).map(topic -> topic.getName()).orElse(null);
            String subjectName = topicId == null ? null : topicRepository.findById(topicId)
                    .flatMap(topic -> subjectRepository.findById(topic.getSubjectId()))
                    .map(subject -> subject.getName()).orElse(null);
            String context = subjectName != null || topicName != null
                    ? " Subject: " + (subjectName != null ? subjectName : "Unknown") + ", topic: " + (topicName != null ? topicName : "Unknown") + "."
                    : "";
            String title = "Study session logged";
            String body = limit("You completed a " + totalMinutes + "-minute study session." + context + " Your progress has been recorded in StudyZen.", 2000);
            if (Boolean.TRUE.equals(s.getNotifySessionLogged())) {
                notificationRepository.insertReminder(userId, "info", title, body, null);
            }
            notificationCenterClient.send(userId, title, body, "info", null, "sessionLogged");
        });
    }

    public void onGoalProgress(UUID userId, Long subjectId, GoalPeriod period) {
        settings(userId).ifPresent(s -> {
            boolean notifyReached = Boolean.TRUE.equals(s.getNotifyGoalReached());
            boolean notify80 = Boolean.TRUE.equals(s.getNotifyGoal80pct());
            if (!notifyReached && !notify80) return;

            Optional<StudyGoal> goalOpt = subjectId == null
                    ? studyGoalRepository.findByUserIdAndSubjectIdIsNullAndPeriod(userId, period)
                    : studyGoalRepository.findByUserIdAndSubjectIdAndPeriod(userId, subjectId, period);

            if (goalOpt.isEmpty()) return;
            StudyGoal goal = goalOpt.get();
            int target = goal.getTargetMinutes();
            if (target <= 0) return;

            int actual = computeActualMinutes(userId, subjectId, period);
            int pct = (int) ((actual * 100L) / target);

            String periodLabel = period == GoalPeriod.daily ? "daily" : "weekly";

            if (notifyReached && actual >= target) {
                String key = "goal-reached:" + userId + ":" + (subjectId != null ? subjectId : "all") + ":" + period + ":" + currentPeriodKey(period);
                String title = "Study goal reached!";
                String body = limit("You reached your " + periodLabel + " study goal of " + target + " minutes. Great work!", 2000);
                notificationRepository.insertReminder(userId, "success", title, body, key);
                notificationCenterClient.send(userId, title, body, "success", key, "goalReached");
            } else if (notify80 && pct >= 80 && actual < target) {
                String key = "goal-80pct:" + userId + ":" + (subjectId != null ? subjectId : "all") + ":" + period + ":" + currentPeriodKey(period);
                String title = "Almost at your study goal!";
                String body = limit("You're at " + pct + "% of your " + periodLabel + " goal (" + actual + "/" + target + " min). Keep going!", 2000);
                notificationRepository.insertReminder(userId, "info", title, body, key);
                notificationCenterClient.send(userId, title, body, "info", key, "goal80pct");
            }
        });
    }

    private int computeActualMinutes(UUID userId, Long subjectId, GoalPeriod period) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime start;
        if (period == GoalPeriod.daily) {
            start = now.toLocalDate().atStartOfDay().atOffset(now.getOffset());
        } else {
            int dow = now.getDayOfWeek().getValue();
            start = now.toLocalDate().minusDays(dow - 1).atStartOfDay().atOffset(now.getOffset());
        }
        List<com.frandm.studytracker.backend.model.StudySession> sessions =
                studySessionRepository.findByUserIdAndDateRange(userId, start, now);

        return sessions.stream()
                .filter(session -> subjectId == null || subjectId.equals(getSubjectIdForSession(session)))
                .mapToInt(com.frandm.studytracker.backend.model.StudySession::getTotalMinutes)
                .sum();
    }

    private Long getSubjectIdForSession(com.frandm.studytracker.backend.model.StudySession session) {
        return topicRepository.findById(session.getTopicId())
                .map(topic -> topic.getSubjectId())
                .orElse(null);
    }

    private String currentPeriodKey(GoalPeriod period) {
        OffsetDateTime now = OffsetDateTime.now();
        if (period == GoalPeriod.daily) {
            return now.toLocalDate().toString();
        }
        int year = now.get(IsoFields.WEEK_BASED_YEAR);
        int week = now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        return year + "-W" + week;
    }
}
