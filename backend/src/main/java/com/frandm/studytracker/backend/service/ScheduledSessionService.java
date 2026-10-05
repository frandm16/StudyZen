package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.ScheduledSession;
import com.frandm.studytracker.backend.model.enums.ScheduledSessionStatus;
import com.frandm.studytracker.backend.repository.ScheduledSessionRepository;
import com.frandm.studytracker.backend.repository.TopicRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import com.frandm.studytracker.backend.util.DateTimeUtils;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ScheduledSessionService {

    private final ScheduledSessionRepository scheduledSessionRepository;
    private final TopicRepository topicRepository;

    public ScheduledSessionService(ScheduledSessionRepository scheduledSessionRepository,
                                   TopicRepository topicRepository) {
        this.scheduledSessionRepository = scheduledSessionRepository;
        this.topicRepository = topicRepository;
    }

    public List<ScheduledSession> getAll() {
        return scheduledSessionRepository.findByUserIdOrderByStartsAtAsc(CurrentUser.id());
    }

    public List<ScheduledSession> getByDateRange(OffsetDateTime start, OffsetDateTime end) {
        return scheduledSessionRepository.findByUserIdAndDateRange(CurrentUser.id(), start, end);
    }

    public ScheduledSession getById(Long id) {
        return scheduledSessionRepository.findByIdAndUserId(id, CurrentUser.id())
                .orElseThrow(() -> new RuntimeException("ScheduledSession not found: " + id));
    }

    public ScheduledSession create(Map<String, Object> body) {
        ScheduledSession session = new ScheduledSession();
        session.setUserId(CurrentUser.id());
        session.setCreatedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        applyFields(session, body, true);
        return scheduledSessionRepository.save(session);
    }

    public ScheduledSession fullUpdate(Long id, Map<String, Object> body) {
        ScheduledSession session = getById(id);
        session.setUpdatedAt(OffsetDateTime.now());
        applyFields(session, body, true);
        return scheduledSessionRepository.save(session);
    }

    public ScheduledSession partialUpdate(Long id, Map<String, Object> body) {
        ScheduledSession session = getById(id);
        session.setUpdatedAt(OffsetDateTime.now());
        applyFields(session, body, false);
        return scheduledSessionRepository.save(session);
    }

    public void delete(Long id) {
        ScheduledSession session = getById(id);
        scheduledSessionRepository.delete(session);
    }

    private void applyFields(ScheduledSession session, Map<String, Object> body, boolean full) {
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

        if (full || body.get("title") != null) {
            session.setTitle((String) body.get("title"));
        }

        if (full || body.get("startsAt") != null) {
            OffsetDateTime startsAt = DateTimeUtils.parseFlexibleOffset(
                    body.get("startsAt") != null ? String.valueOf(body.get("startsAt")) : null);
            if (startsAt == null) {
                throw new RuntimeException("startsAt is required");
            }
            session.setStartsAt(startsAt);
        }

        if (full || body.get("endsAt") != null) {
            OffsetDateTime endsAt = DateTimeUtils.parseFlexibleOffset(
                    body.get("endsAt") != null ? String.valueOf(body.get("endsAt")) : null);
            if (endsAt == null) {
                throw new RuntimeException("endsAt is required");
            }
            session.setEndsAt(endsAt);
        }

        if (full || body.get("status") != null) {
            String raw = body.get("status") != null ? String.valueOf(body.get("status")) : null;
            ScheduledSessionStatus status = raw != null && !raw.isBlank()
                    ? ScheduledSessionStatus.valueOf(raw)
                    : ScheduledSessionStatus.scheduled;
            session.setStatus(status);
        }
    }
}
