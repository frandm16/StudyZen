package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.Deadline;
import com.frandm.studytracker.backend.service.DeadlineService;
import com.frandm.studytracker.backend.util.DateTimeUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deadlines")
@CrossOrigin
public class DeadlineController {

    private final DeadlineService deadlineService;

    public DeadlineController(DeadlineService deadlineService) {
        this.deadlineService = deadlineService;
    }

    @GetMapping
    public List<Deadline> list(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {

        OffsetDateTime startDt = null;
        OffsetDateTime endDt = null;

        if (start != null && !start.isBlank()) {
            startDt = DateTimeUtils.parseFlexibleOffset(start);
        }
        if (end != null && !end.isBlank()) {
            endDt = DateTimeUtils.parseFlexibleOffset(end);
        }

        return deadlineService.list(startDt, endDt);
    }

    @GetMapping("/{id}")
    public Deadline get(@PathVariable Long id) {
        return deadlineService.getById(id);
    }

    @PostMapping
    public Deadline create(@RequestBody Map<String, Object> body) {
        // Parse dueAt from body
        Object dueAtObj = body.get("dueAt");
        if (dueAtObj != null && dueAtObj instanceof String) {
            body.put("dueAt", DateTimeUtils.parseFlexibleOffset((String) dueAtObj));
        }
        return deadlineService.create(body);
    }

    @PutMapping("/{id}")
    public Deadline update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        // Parse dueAt from body
        Object dueAtObj = body.get("dueAt");
        if (dueAtObj != null && dueAtObj instanceof String) {
            body.put("dueAt", DateTimeUtils.parseFlexibleOffset((String) dueAtObj));
        }
        return deadlineService.fullUpdate(id, body);
    }

    @PatchMapping("/{id}")
    public Deadline patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        // Parse dueAt from body if present
        Object dueAtObj = body.get("dueAt");
        if (dueAtObj != null && dueAtObj instanceof String) {
            body.put("dueAt", DateTimeUtils.parseFlexibleOffset((String) dueAtObj));
        }
        return deadlineService.partialUpdate(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deadlineService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/toggle")
    public Deadline toggle(@PathVariable Long id) {
        return deadlineService.toggleCompleted(id);
    }
}
