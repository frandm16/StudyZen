package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Deadline;
import com.frandm.studytracker.backend.model.enums.DeadlineType;
import com.frandm.studytracker.backend.model.enums.UrgencyLevel;
import com.frandm.studytracker.backend.repository.DeadlineRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.repository.TopicRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DeadlineService {

    private final DeadlineRepository deadlineRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;

    public DeadlineService(DeadlineRepository deadlineRepository,
                           SubjectRepository subjectRepository,
                           TopicRepository topicRepository) {
        this.deadlineRepository = deadlineRepository;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
    }

    public List<Deadline> list(OffsetDateTime start, OffsetDateTime end) {
        UUID userId = CurrentUser.id();
        if (start != null && end != null) {
            return deadlineRepository.findByUserIdAndDateRange(userId, start, end);
        }
        return deadlineRepository.findByUserIdOrderByDueAtAsc(userId);
    }

    public Deadline getById(Long id) {
        UUID userId = CurrentUser.id();
        return deadlineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Deadline not found: " + id));
    }

    public Deadline create(Map<String, Object> body) {
        UUID userId = CurrentUser.id();

        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            throw new RuntimeException("Deadline title is required");
        }

        Long subjectId = body.get("subjectId") != null ?
            ((Number) body.get("subjectId")).longValue() : null;
        Long topicId = body.get("topicId") != null ?
            ((Number) body.get("topicId")).longValue() : null;

        // Verify subject ownership if provided
        if (subjectId != null) {
            subjectRepository.findByIdAndUserId(subjectId, userId)
                    .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectId));
        }

        // Verify topic ownership if provided
        if (topicId != null) {
            if (subjectId == null) {
                throw new RuntimeException("A topic deadline requires a subject");
            }
            topicRepository.findByIdAndUserId(topicId, userId)
                    .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
        }

        Deadline deadline = new Deadline();
        deadline.setUserId(userId);
        deadline.setSubjectId(subjectId);
        deadline.setTopicId(topicId);
        deadline.setTitle(title);
        deadline.setDescription((String) body.get("description"));

        String typeStr = (String) body.get("type");
        deadline.setType(typeStr != null ? DeadlineType.valueOf(typeStr) : DeadlineType.assignment);

        String urgencyStr = (String) body.get("urgency");
        deadline.setUrgency(urgencyStr != null ? UrgencyLevel.valueOf(urgencyStr) : UrgencyLevel.medium);

        Boolean allDay = (Boolean) body.get("allDay");
        deadline.setAllDay(allDay != null ? allDay : false);

        deadline.setDueAt((OffsetDateTime) body.get("dueAt"));
        deadline.setCompleted(false);
        deadline.setCreatedAt(OffsetDateTime.now());
        deadline.setUpdatedAt(OffsetDateTime.now());

        return deadlineRepository.save(deadline);
    }

    public Deadline fullUpdate(Long id, Map<String, Object> body) {
        UUID userId = CurrentUser.id();
        Deadline deadline = deadlineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Deadline not found: " + id));

        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            throw new RuntimeException("Deadline title is required");
        }

        Long subjectId = body.get("subjectId") != null ?
            ((Number) body.get("subjectId")).longValue() : null;
        Long topicId = body.get("topicId") != null ?
            ((Number) body.get("topicId")).longValue() : null;

        // Verify subject ownership if provided
        if (subjectId != null) {
            subjectRepository.findByIdAndUserId(subjectId, userId)
                    .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectId));
        }

        // Verify topic ownership if provided
        if (topicId != null) {
            if (subjectId == null) {
                throw new RuntimeException("A topic deadline requires a subject");
            }
            topicRepository.findByIdAndUserId(topicId, userId)
                    .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
        }

        deadline.setSubjectId(subjectId);
        deadline.setTopicId(topicId);
        deadline.setTitle(title);
        deadline.setDescription((String) body.get("description"));

        String typeStr = (String) body.get("type");
        if (typeStr != null) deadline.setType(DeadlineType.valueOf(typeStr));

        String urgencyStr = (String) body.get("urgency");
        if (urgencyStr != null) deadline.setUrgency(UrgencyLevel.valueOf(urgencyStr));

        Boolean allDay = (Boolean) body.get("allDay");
        if (allDay != null) deadline.setAllDay(allDay);

        deadline.setDueAt((OffsetDateTime) body.get("dueAt"));
        deadline.setUpdatedAt(OffsetDateTime.now());

        return deadlineRepository.save(deadline);
    }

    public Deadline partialUpdate(Long id, Map<String, Object> body) {
        UUID userId = CurrentUser.id();
        Deadline deadline = deadlineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Deadline not found: " + id));

        if (body.containsKey("subjectId")) {
            Long subjectId = body.get("subjectId") != null ?
                ((Number) body.get("subjectId")).longValue() : null;
            if (subjectId != null) {
                subjectRepository.findByIdAndUserId(subjectId, userId)
                        .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectId));
            }
            deadline.setSubjectId(subjectId);
        }

        if (body.containsKey("topicId")) {
            Long topicId = body.get("topicId") != null ?
                ((Number) body.get("topicId")).longValue() : null;
            if (topicId != null) {
                if (deadline.getSubjectId() == null) {
                    throw new RuntimeException("A topic deadline requires a subject");
                }
                topicRepository.findByIdAndUserId(topicId, userId)
                        .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
            }
            deadline.setTopicId(topicId);
        }

        if (body.containsKey("title")) {
            String title = (String) body.get("title");
            if (title == null || title.isBlank()) {
                throw new RuntimeException("Deadline title is required");
            }
            deadline.setTitle(title);
        }

        if (body.containsKey("description")) {
            deadline.setDescription((String) body.get("description"));
        }

        if (body.containsKey("type")) {
            String typeStr = (String) body.get("type");
            if (typeStr != null) deadline.setType(DeadlineType.valueOf(typeStr));
        }

        if (body.containsKey("urgency")) {
            String urgencyStr = (String) body.get("urgency");
            if (urgencyStr != null) deadline.setUrgency(UrgencyLevel.valueOf(urgencyStr));
        }

        if (body.containsKey("allDay")) {
            Boolean allDay = (Boolean) body.get("allDay");
            if (allDay != null) deadline.setAllDay(allDay);
        }

        if (body.containsKey("dueAt")) {
            deadline.setDueAt((OffsetDateTime) body.get("dueAt"));
        }

        if (body.containsKey("isCompleted")) {
            Boolean isCompleted = (Boolean) body.get("isCompleted");
            if (isCompleted != null) {
                boolean wasCompleted = deadline.isCompleted();
                deadline.setCompleted(isCompleted);
                if (isCompleted && !wasCompleted) {
                    deadline.setCompletedAt(OffsetDateTime.now());
                } else if (!isCompleted && wasCompleted) {
                    deadline.setCompletedAt(null);
                }
            }
        }

        deadline.setUpdatedAt(OffsetDateTime.now());
        return deadlineRepository.save(deadline);
    }

    public void delete(Long id) {
        UUID userId = CurrentUser.id();
        Deadline deadline = deadlineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Deadline not found: " + id));
        deadlineRepository.delete(deadline);
    }

    public Deadline toggleCompleted(Long id) {
        UUID userId = CurrentUser.id();
        Deadline deadline = deadlineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Deadline not found: " + id));
        boolean newCompleted = !deadline.isCompleted();
        deadline.setCompleted(newCompleted);
        if (newCompleted) {
            deadline.setCompletedAt(OffsetDateTime.now());
        } else {
            deadline.setCompletedAt(null);
        }
        deadline.setUpdatedAt(OffsetDateTime.now());
        return deadlineRepository.save(deadline);
    }
}
