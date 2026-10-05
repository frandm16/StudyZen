package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.Topic;
import com.frandm.studytracker.backend.model.enums.TopicStatus;
import com.frandm.studytracker.backend.service.TopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping
    public List<Topic> list(@RequestParam(required = false) Long subjectId) {
        return topicService.getAll(subjectId);
    }

    @GetMapping("/{id:\\d+}")
    public Topic get(@PathVariable Long id) {
        return topicService.getById(id);
    }

    @PostMapping
    public Topic create(@RequestBody Map<String, Object> body) {
        return topicService.create(
                (String) body.get("name"),
                longValue(body.get("subjectId")),
                (String) body.get("description"),
                status(body.get("status")),
                shortValue(body.get("confidence")),
                intValue(body.get("sortOrder"))
        );
    }

    @PutMapping("/{id:\\d+}")
    public Topic update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return topicService.fullUpdate(
                id,
                (String) body.get("name"),
                longValue(body.get("subjectId")),
                (String) body.get("description"),
                status(body.get("status")),
                shortValue(body.get("confidence")),
                intValue(body.get("sortOrder"))
        );
    }

    @PatchMapping("/{id:\\d+}")
    public Topic patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return topicService.partialUpdate(
                id,
                (String) body.get("name"),
                longValue(body.get("subjectId")),
                (String) body.get("description"),
                status(body.get("status")),
                shortValue(body.get("confidence")),
                intValue(body.get("sortOrder"))
        );
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.ok().build();
    }

    private Long longValue(Object value) {
        return value != null ? ((Number) value).longValue() : null;
    }

    private Integer intValue(Object value) {
        return value != null ? ((Number) value).intValue() : null;
    }

    private Short shortValue(Object value) {
        return value != null ? ((Number) value).shortValue() : null;
    }

    private TopicStatus status(Object value) {
        return value != null ? TopicStatus.valueOf((String) value) : null;
    }
}
