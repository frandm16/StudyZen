package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Assessment;
import com.frandm.studytracker.backend.model.Deadline;
import com.frandm.studytracker.backend.model.ScheduledSession;
import com.frandm.studytracker.backend.model.StudySession;
import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.model.Topic;
import com.frandm.studytracker.backend.repository.AssessmentRepository;
import com.frandm.studytracker.backend.repository.DeadlineRepository;
import com.frandm.studytracker.backend.repository.ScheduledSessionRepository;
import com.frandm.studytracker.backend.repository.StudySessionRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CalendarIcsService {

    private static final DateTimeFormatter UTC_DATETIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);

    private final ScheduledSessionRepository scheduledSessionRepository;
    private final StudySessionRepository studySessionRepository;
    private final DeadlineRepository deadlineRepository;
    private final AssessmentRepository assessmentRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;

    public CalendarIcsService(
            ScheduledSessionRepository scheduledSessionRepository,
            StudySessionRepository studySessionRepository,
            DeadlineRepository deadlineRepository,
            AssessmentRepository assessmentRepository,
            SubjectRepository subjectRepository,
            TopicRepository topicRepository
    ) {
        this.scheduledSessionRepository = scheduledSessionRepository;
        this.studySessionRepository = studySessionRepository;
        this.deadlineRepository = deadlineRepository;
        this.assessmentRepository = assessmentRepository;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
    }

    public String generateCalendarIcs(UUID userId, Long filterSubjectId, Set<String> layers) {
        Map<Long, Subject> subjectMap = subjectRepository.findByUserIdOrderByNameAsc(userId)
                .stream()
                .collect(Collectors.toMap(Subject::getId, Function.identity()));

        Map<Long, Topic> topicMap = topicRepository.findByUserIdOrderBySortOrderAscNameAsc(userId)
                .stream()
                .collect(Collectors.toMap(Topic::getId, Function.identity()));

        String calendarName = "StudyZen Calendar";
        if (filterSubjectId != null && subjectMap.containsKey(filterSubjectId)) {
            calendarName = "StudyZen - " + subjectMap.get(filterSubjectId).getName();
        }

        StringBuilder ics = new StringBuilder();
        appendFoldedLine(ics, "BEGIN:VCALENDAR");
        appendFoldedLine(ics, "VERSION:2.0");
        appendFoldedLine(ics, "PRODID:-//StudyZen//StudyZen Calendar//EN");
        appendFoldedLine(ics, "CALSCALE:GREGORIAN");
        appendFoldedLine(ics, "METHOD:PUBLISH");
        appendFoldedLine(ics, "X-WR-CALNAME:" + escapeIcsText(calendarName));
        appendFoldedLine(ics, "X-WR-TIMEZONE:UTC");

        String nowFormatted = formatUtcDateTime(Instant.now());

        boolean includeScheduled = layers == null || layers.contains("scheduled");
        boolean includeCompleted = layers == null || layers.contains("completed");
        boolean includeDeadlines = layers == null || layers.contains("deadlines");
        boolean includeExams = layers == null || layers.contains("exams");

        if (includeScheduled) {
            List<ScheduledSession> scheduledList = scheduledSessionRepository.findByUserIdOrderByStartsAtAsc(userId);
            for (ScheduledSession session : scheduledList) {
                Topic topic = session.getTopicId() != null ? topicMap.get(session.getTopicId()) : null;
                Long subjectId = topic != null ? topic.getSubjectId() : null;
                if (filterSubjectId != null && !Objects.equals(filterSubjectId, subjectId)) {
                    continue;
                }
                Subject subject = subjectId != null ? subjectMap.get(subjectId) : null;
                String subjectName = subject != null ? subject.getName() : "General";
                String topicName = topic != null ? topic.getName() : "";
                String title = session.getTitle() != null && !session.getTitle().isBlank()
                        ? session.getTitle()
                        : (topicName.isBlank() ? "Study Session" : topicName);

                appendFoldedLine(ics, "BEGIN:VEVENT");
                appendFoldedLine(ics, "UID:studyzen-scheduled-" + session.getId() + "@studyzen.app");
                appendFoldedLine(ics, "DTSTAMP:" + nowFormatted);
                appendFoldedLine(ics, "DTSTART:" + formatOffsetDateTime(session.getStartsAt()));
                appendFoldedLine(ics, "DTEND:" + formatOffsetDateTime(session.getEndsAt()));
                appendFoldedLine(ics, "SUMMARY:" + escapeIcsText("[" + subjectName + "] " + title));
                appendFoldedLine(ics, "DESCRIPTION:" + escapeIcsText(
                        (topicName.isBlank() ? "" : "Topic: " + topicName + "\\n") + "Subject: " + subjectName
                ));
                appendFoldedLine(ics, "CATEGORIES:" + escapeIcsText("Scheduled Study," + subjectName));
                appendFoldedLine(ics, "STATUS:CONFIRMED");
                appendFoldedLine(ics, "END:VEVENT");
            }
        }

        if (includeCompleted) {
            List<StudySession> completedList = studySessionRepository.findByUserIdOrderByStartedAtDesc(userId);
            for (StudySession session : completedList) {
                Topic topic = session.getTopicId() != null ? topicMap.get(session.getTopicId()) : null;
                Long subjectId = topic != null ? topic.getSubjectId() : null;
                if (filterSubjectId != null && !Objects.equals(filterSubjectId, subjectId)) {
                    continue;
                }
                Subject subject = subjectId != null ? subjectMap.get(subjectId) : null;
                String subjectName = subject != null ? subject.getName() : "General";
                String topicName = topic != null ? topic.getName() : "";
                String title = session.getTitle() != null && !session.getTitle().isBlank()
                        ? session.getTitle()
                        : (topicName.isBlank() ? "Study Log" : topicName);

                appendFoldedLine(ics, "BEGIN:VEVENT");
                appendFoldedLine(ics, "UID:studyzen-session-" + session.getId() + "@studyzen.app");
                appendFoldedLine(ics, "DTSTAMP:" + nowFormatted);
                appendFoldedLine(ics, "DTSTART:" + formatOffsetDateTime(session.getStartedAt()));
                appendFoldedLine(ics, "DTEND:" + formatOffsetDateTime(session.getEndedAt()));
                appendFoldedLine(ics, "SUMMARY:" + escapeIcsText("✓ [" + subjectName + "] " + title));
                appendFoldedLine(ics, "DESCRIPTION:" + escapeIcsText(
                        "Studied: " + session.getTotalMinutes() + " min\\n" +
                        (topicName.isBlank() ? "" : "Topic: " + topicName + "\\n") +
                        "Subject: " + subjectName
                ));
                appendFoldedLine(ics, "CATEGORIES:" + escapeIcsText("Completed Study," + subjectName));
                appendFoldedLine(ics, "STATUS:CONFIRMED");
                appendFoldedLine(ics, "END:VEVENT");
            }
        }

        if (includeDeadlines) {
            List<Deadline> deadlineList = deadlineRepository.findByUserIdOrderByDueAtAsc(userId);
            for (Deadline deadline : deadlineList) {
                if (filterSubjectId != null && !Objects.equals(filterSubjectId, deadline.getSubjectId())) {
                    continue;
                }
                Subject subject = deadline.getSubjectId() != null ? subjectMap.get(deadline.getSubjectId()) : null;
                String subjectName = subject != null ? subject.getName() : "General";

                appendFoldedLine(ics, "BEGIN:VEVENT");
                appendFoldedLine(ics, "UID:studyzen-deadline-" + deadline.getId() + "@studyzen.app");
                appendFoldedLine(ics, "DTSTAMP:" + nowFormatted);

                if (deadline.isAllDay()) {
                    appendFoldedLine(ics, "DTSTART;VALUE=DATE:" + formatDate(deadline.getDueAt()));
                    appendFoldedLine(ics, "DTEND;VALUE=DATE:" + formatDate(deadline.getDueAt().plusDays(1)));
                } else {
                    appendFoldedLine(ics, "DTSTART:" + formatOffsetDateTime(deadline.getDueAt()));
                    appendFoldedLine(ics, "DTEND:" + formatOffsetDateTime(deadline.getDueAt().plusMinutes(30)));
                }

                String prefix = deadline.isCompleted() ? "✓ [Done] " : "Due: ";
                appendFoldedLine(ics, "SUMMARY:" + escapeIcsText(prefix + "[" + subjectName + "] " + deadline.getTitle()));
                appendFoldedLine(ics, "DESCRIPTION:" + escapeIcsText(
                        "Type: " + deadline.getType() + "\\n" +
                        "Urgency: " + deadline.getUrgency() + "\\n" +
                        "Subject: " + subjectName +
                        (deadline.getDescription() != null && !deadline.getDescription().isBlank() ? "\\n" + deadline.getDescription() : "")
                ));
                appendFoldedLine(ics, "CATEGORIES:" + escapeIcsText("Deadline," + subjectName));
                if (deadline.isCompleted()) {
                    appendFoldedLine(ics, "STATUS:COMPLETED");
                } else {
                    appendFoldedLine(ics, "STATUS:CONFIRMED");
                }
                appendFoldedLine(ics, "END:VEVENT");
            }
        }

        if (includeExams) {
            List<Assessment> assessmentList = assessmentRepository.findByUserIdOrderByDueAtAsc(userId);
            for (Assessment assessment : assessmentList) {
                if (filterSubjectId != null && !Objects.equals(filterSubjectId, assessment.getSubjectId())) {
                    continue;
                }
                if (assessment.getDueAt() == null) {
                    continue;
                }
                Subject subject = assessment.getSubjectId() != null ? subjectMap.get(assessment.getSubjectId()) : null;
                String subjectName = subject != null ? subject.getName() : "Subject";

                appendFoldedLine(ics, "BEGIN:VEVENT");
                appendFoldedLine(ics, "UID:studyzen-assessment-" + assessment.getId() + "@studyzen.app");
                appendFoldedLine(ics, "DTSTAMP:" + nowFormatted);
                appendFoldedLine(ics, "DTSTART:" + formatOffsetDateTime(assessment.getDueAt()));
                appendFoldedLine(ics, "DTEND:" + formatOffsetDateTime(assessment.getDueAt().plusHours(2)));
                appendFoldedLine(ics, "SUMMARY:" + escapeIcsText("Exam: " + assessment.getTitle() + " (" + subjectName + ")"));
                appendFoldedLine(ics, "DESCRIPTION:" + escapeIcsText(
                        "Type: " + assessment.getType() + "\\n" +
                        "Subject: " + subjectName + "\\n" +
                        "Weight: " + assessment.getWeightPercent() + "%"
                ));
                appendFoldedLine(ics, "CATEGORIES:" + escapeIcsText("Exam," + subjectName));
                appendFoldedLine(ics, "STATUS:CONFIRMED");
                appendFoldedLine(ics, "END:VEVENT");
            }
        }

        appendFoldedLine(ics, "END:VCALENDAR");
        return ics.toString();
    }

    private String formatOffsetDateTime(OffsetDateTime dateTime) {
        if (dateTime == null) {
            return formatUtcDateTime(Instant.now());
        }
        return UTC_DATETIME_FORMATTER.format(dateTime.toInstant());
    }

    private String formatUtcDateTime(Instant instant) {
        return UTC_DATETIME_FORMATTER.format(instant);
    }

    private String formatDate(OffsetDateTime dateTime) {
        if (dateTime == null) {
            return DATE_FORMATTER.format(Instant.now());
        }
        return DATE_FORMATTER.format(dateTime.toInstant());
    }

    private String escapeIcsText(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\r\n", "\\n")
                .replace("\n", "\\n")
                .replace("\r", "\\n");
    }

    private void appendFoldedLine(StringBuilder sb, String line) {
        byte[] bytes = line.getBytes(StandardCharsets.UTF_8);
        if (bytes.length <= 75) {
            sb.append(line).append("\r\n");
            return;
        }

        int currentByteCount = 0;
        int startIndex = 0;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            int charByteLen = String.valueOf(c).getBytes(StandardCharsets.UTF_8).length;
            if (currentByteCount + charByteLen > 74) {
                if (startIndex == 0) {
                    sb.append(line, startIndex, i).append("\r\n");
                } else {
                    sb.append(" ").append(line, startIndex, i).append("\r\n");
                }
                startIndex = i;
                currentByteCount = 1 + charByteLen;
            } else {
                currentByteCount += charByteLen;
            }
        }
        if (startIndex < line.length()) {
            if (startIndex == 0) {
                sb.append(line, startIndex, line.length()).append("\r\n");
            } else {
                sb.append(" ").append(line, startIndex, line.length()).append("\r\n");
            }
        }
    }
}
