package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.ScheduledSession;
import com.frandm.studytracker.backend.service.ScheduledSessionService;
import com.frandm.studytracker.backend.util.DateTimeUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scheduled")
public class ScheduledSessionController {

    private final ScheduledSessionService scheduledSessionService;

    public ScheduledSessionController(ScheduledSessionService scheduledSessionService) {
        this.scheduledSessionService = scheduledSessionService;
    }

    @GetMapping
    public List<ScheduledSession> list(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {

        if (start != null && end != null) {
            return scheduledSessionService.getByDateRange(
                    DateTimeUtils.parseFlexibleOffset(start),
                    DateTimeUtils.parseFlexibleOffset(end)
            );
        }
        return scheduledSessionService.getAll();
    }

    @GetMapping("/{id}")
    public ScheduledSession get(@PathVariable Long id) {
        return scheduledSessionService.getById(id);
    }

    @PostMapping
    public ScheduledSession create(@RequestBody Map<String, Object> body) {
        return scheduledSessionService.create(body);
    }

    @PutMapping("/{id}")
    public ScheduledSession update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return scheduledSessionService.fullUpdate(id, body);
    }

    @PatchMapping("/{id}")
    public ScheduledSession patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return scheduledSessionService.partialUpdate(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduledSessionService.delete(id);
        return ResponseEntity.ok().build();
    }
}
