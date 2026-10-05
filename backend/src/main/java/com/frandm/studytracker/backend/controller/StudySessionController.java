package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.StudySession;
import com.frandm.studytracker.backend.service.StudySessionService;
import com.frandm.studytracker.backend.util.DateTimeUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin
public class StudySessionController {

    private final StudySessionService studySessionService;

    public StudySessionController(StudySessionService studySessionService) {
        this.studySessionService = studySessionService;
    }

    @GetMapping
    public List<StudySession> list(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Long topicId) {

        if (start != null && end != null) {
            return studySessionService.getByDateRange(
                    DateTimeUtils.parseFlexibleOffset(start),
                    DateTimeUtils.parseFlexibleOffset(end)
            );
        }
        if (topicId != null) {
            return studySessionService.getByTopicId(topicId);
        }
        return studySessionService.getAll();
    }

    @GetMapping("/range")
    public List<StudySession> getByRange(
            @RequestParam String start,
            @RequestParam String end) {
        return studySessionService.getByDateRange(
                DateTimeUtils.parseFlexibleOffset(start),
                DateTimeUtils.parseFlexibleOffset(end)
        );
    }

    @GetMapping("/{id}")
    public StudySession get(@PathVariable Long id) {
        return studySessionService.getById(id);
    }

    @PostMapping
    public StudySession create(@RequestBody Map<String, Object> body) {
        return studySessionService.create(body);
    }

    @PutMapping("/{id}")
    public StudySession update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return studySessionService.fullUpdate(id, body);
    }

    @PatchMapping("/{id}")
    public StudySession patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return studySessionService.partialUpdate(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studySessionService.delete(id);
        return ResponseEntity.ok().build();
    }
}
