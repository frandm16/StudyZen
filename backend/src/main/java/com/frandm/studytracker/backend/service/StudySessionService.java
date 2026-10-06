package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.StudySession;
import com.frandm.studytracker.backend.repository.ScheduledSessionRepository;
import com.frandm.studytracker.backend.repository.StudySessionRepository;
import com.frandm.studytracker.backend.repository.TopicRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import com.frandm.studytracker.backend.util.DateTimeUtils;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final TopicRepository topicRepository;
    private final ScheduledSessionRepository scheduledSessionRepository;

    public StudySessionService(StudySessionRepository studySessionRepository,
                               TopicRepository topicRepository,
                               ScheduledSessionRepository scheduledSessionRepository) {
        this.studySessionRepository = studySessionRepository;
        this.topicRepository = topicRepository;
        this.scheduledSessionRepository = scheduledSessionRepository;
    }

    public List<StudySession> getAll() {
        return studySessionRepository.findByUserIdOrderByStartedAtDesc(CurrentUser.id());
    }

    public List<StudySession> getByTopicId(Long topicId) {
        return studySessionRepository.findByUserIdAndTopicIdOrderByStartedAtDesc(CurrentUser.id(), topicId);
    }

    public List<StudySession> getByDateRange(OffsetDateTime start, OffsetDateTime end) {
        return studySessionRepository.findByUserIdAndDateRange(CurrentUser.id(), start, end);
    }

    public StudySession getById(Long id) {
        return studySessionRepository.findByIdAndUserId(id, CurrentUser.id())
                .orElseThrow(() -> new RuntimeException("StudySession not found: " + id));
    }

    public StudySession create(Map<String, Object> body) {
        StudySession session = new StudySession();
        session.setUserId(CurrentUser.id());
        session.setCreatedAt(OffsetDateTime.now());
        applyFields(session, body, true);
        return studySessionRepository.save(session);
    }

    public StudySession fullUpdate(Long id, Map<String, Object> body) {
        StudySession session = getById(id);
        applyFields(session, body, true);
        return studySessionRepository.save(session);
    }

    public StudySession partialUpdate(Long id, Map<String, Object> body) {
        StudySession session = getById(id);
        applyFields(session, body, false);
        return studySessionRepository.save(session);
    }

    public void delete(Long id) {
        StudySession session = getById(id);
        studySessionRepository.delete(session);
    }

    private void applyFields(StudySession session, Map<String, Object> body, boolean full) {
        UUID userId = CurrentUser.id();

        if (full || body.get("topicId") != null) {
            Long topicId = body.get("topicId") != null ? ((Number) body.get("topicId")).longValue() : null;
            if (topicId == null) {
                throw new RuntimeException("Topic not found: " + topicId);
            }
            topicRepository.findByIdAndUserId(topicId, userId)
                    .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
            session.setTopicId(topicId);
        }

        if (full || body.get("scheduledSessionId") != null) {
            Long scheduledSessionId = body.get("scheduledSessionId") != null
                    ? ((Number) body.get("scheduledSessionId")).longValue()
                    : null;
            if (scheduledSessionId != null) {
                scheduledSessionRepository.findByIdAndUserId(scheduledSessionId, userId)
                        .orElseThrow(() -> new RuntimeException("ScheduledSession not found: " + scheduledSessionId));
            }
            session.setScheduledSessionId(scheduledSessionId);
        }

        if (full || body.get("title") != null) {
            session.setTitle((String) body.get("title"));
        }

        if (full || body.get("description") != null) {
            session.setDescription((String) body.get("description"));
        }

        if (full || body.get("totalMinutes") != null) {
            int totalMinutes = body.get("totalMinutes") != null
                    ? ((Number) body.get("totalMinutes")).intValue()
                    : 0;
            if (totalMinutes <= 0) {
                throw new RuntimeException("totalMinutes must be > 0");
            }
            session.setTotalMinutes(totalMinutes);
        }

        if (full || body.get("pausedMinutes") != null) {
            int pausedMinutes = body.get("pausedMinutes") != null
                    ? ((Number) body.get("pausedMinutes")).intValue()
                    : 0;
            session.setPausedMinutes(pausedMinutes);
        }

        if (full || body.get("focusRating") != null) {
            Short focusRating = body.get("focusRating") != null
                    ? ((Number) body.get("focusRating")).shortValue()
                    : null;
            if (focusRating != null && (focusRating < 0 || focusRating > 5)) {
                throw new RuntimeException("focusRating must be between 0 and 5");
            }
            session.setFocusRating(focusRating);
        }

        if (full || body.get("startedAt") != null) {
            OffsetDateTime startedAt = DateTimeUtils.parseFlexibleOffset(
                    body.get("startedAt") != null ? String.valueOf(body.get("startedAt")) : null);
            if (startedAt == null) {
                throw new RuntimeException("startedAt is required");
            }
            session.setStartedAt(startedAt);
        }

        if (full || body.get("endedAt") != null) {
            OffsetDateTime endedAt = DateTimeUtils.parseFlexibleOffset(
                    body.get("endedAt") != null ? String.valueOf(body.get("endedAt")) : null);
            if (endedAt == null) {
                throw new RuntimeException("endedAt is required");
            }
            session.setEndedAt(endedAt);
        }
    }
}
