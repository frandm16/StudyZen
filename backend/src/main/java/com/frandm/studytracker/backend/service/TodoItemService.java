package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.TodoItem;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.repository.TodoItemRepository;
import com.frandm.studytracker.backend.repository.TopicRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TodoItemService {

    private final TodoItemRepository todoItemRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;

    public TodoItemService(TodoItemRepository todoItemRepository,
                           SubjectRepository subjectRepository,
                           TopicRepository topicRepository) {
        this.todoItemRepository = todoItemRepository;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
    }

    public List<TodoItem> list(LocalDate date) {
        UUID userId = CurrentUser.id();
        if (date != null) {
            return todoItemRepository.findByUserIdAndDateOrderByIdAsc(userId, date);
        }
        return todoItemRepository.findByUserIdOrderByIdAsc(userId);
    }

    public TodoItem getById(Long id) {
        UUID userId = CurrentUser.id();
        return todoItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("TodoItem not found: " + id));
    }

    public TodoItem create(Map<String, Object> body) {
        UUID userId = CurrentUser.id();

        LocalDate date = LocalDate.parse((String) body.get("date"));
        String text = (String) body.get("text");

        if (text == null || text.isBlank()) {
            throw new RuntimeException("TodoItem text is required");
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
                throw new RuntimeException("A topic todo requires a subject");
            }
            topicRepository.findByIdAndUserId(topicId, userId)
                    .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
        }

        TodoItem item = new TodoItem();
        item.setUserId(userId);
        item.setDate(date);
        item.setText(text);
        item.setSubjectId(subjectId);
        item.setTopicId(topicId);
        item.setCompleted(false);
        item.setCreatedAt(OffsetDateTime.now());

        return todoItemRepository.save(item);
    }

    public TodoItem fullUpdate(Long id, Map<String, Object> body) {
        UUID userId = CurrentUser.id();
        TodoItem item = todoItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("TodoItem not found: " + id));

        LocalDate date = LocalDate.parse((String) body.get("date"));
        String text = (String) body.get("text");

        if (text == null || text.isBlank()) {
            throw new RuntimeException("TodoItem text is required");
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
                throw new RuntimeException("A topic todo requires a subject");
            }
            topicRepository.findByIdAndUserId(topicId, userId)
                    .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
        }

        item.setDate(date);
        item.setText(text);
        item.setSubjectId(subjectId);
        item.setTopicId(topicId);

        Boolean completed = parseBoolean(body.get("isCompleted"), body.get("completed"));
        if (completed != null) {
            boolean wasCompleted = item.isCompleted();
            item.setCompleted(completed);
            if (completed && !wasCompleted) {
                item.setCompletedAt(OffsetDateTime.now());
            } else if (!completed && wasCompleted) {
                item.setCompletedAt(null);
            }
        }

        return todoItemRepository.save(item);
    }

    public TodoItem partialUpdate(Long id, Map<String, Object> body) {
        UUID userId = CurrentUser.id();
        TodoItem item = todoItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("TodoItem not found: " + id));

        if (body.containsKey("subjectId")) {
            Long subjectId = body.get("subjectId") != null ?
                ((Number) body.get("subjectId")).longValue() : null;
            if (subjectId != null) {
                subjectRepository.findByIdAndUserId(subjectId, userId)
                        .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectId));
            }
            item.setSubjectId(subjectId);
        }

        if (body.containsKey("topicId")) {
            Long topicId = body.get("topicId") != null ?
                ((Number) body.get("topicId")).longValue() : null;
            if (topicId != null) {
                if (item.getSubjectId() == null) {
                    throw new RuntimeException("A topic todo requires a subject");
                }
                topicRepository.findByIdAndUserId(topicId, userId)
                        .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
            }
            item.setTopicId(topicId);
        }

        if (body.containsKey("text")) {
            String text = (String) body.get("text");
            if (text != null) item.setText(text);
        }

        if (body.containsKey("completed") || body.containsKey("isCompleted")) {
            Boolean completed = parseBoolean(body.get("isCompleted"), body.get("completed"));
            if (completed != null) {
                boolean wasCompleted = item.isCompleted();
                item.setCompleted(completed);
                if (completed && !wasCompleted) {
                    item.setCompletedAt(OffsetDateTime.now());
                } else if (!completed && wasCompleted) {
                    item.setCompletedAt(null);
                }
            }
        }

        return todoItemRepository.save(item);
    }

    public void delete(Long id) {
        UUID userId = CurrentUser.id();
        TodoItem item = todoItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("TodoItem not found: " + id));
        todoItemRepository.delete(item);
    }

    private Boolean parseBoolean(Object v1, Object v2) {
        Object val = v1 != null ? v1 : v2;
        if (val instanceof Boolean b) return b;
        if (val instanceof String s) return Boolean.parseBoolean(s);
        return null;
    }
}
