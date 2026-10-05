package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.StudyGoal;
import com.frandm.studytracker.backend.model.enums.GoalPeriod;
import com.frandm.studytracker.backend.service.StudyGoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin
public class StudyGoalController {

    private final StudyGoalService studyGoalService;

    public StudyGoalController(StudyGoalService studyGoalService) {
        this.studyGoalService = studyGoalService;
    }

    @GetMapping
    public List<StudyGoal> list() {
        return studyGoalService.getAll();
    }

    @GetMapping("/{id:\\d+}")
    public StudyGoal get(@PathVariable Long id) {
        return studyGoalService.getById(id);
    }

    @PostMapping
    public StudyGoal create(@RequestBody Map<String, Object> body) {
        return studyGoalService.create(
                longValue(body.get("subjectId")),
                GoalPeriod.valueOf((String) body.get("period")),
                ((Number) body.get("targetMinutes")).intValue()
        );
    }

    @PutMapping("/{id:\\d+}")
    public StudyGoal update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return studyGoalService.fullUpdate(
                id,
                longValue(body.get("subjectId")),
                GoalPeriod.valueOf((String) body.get("period")),
                ((Number) body.get("targetMinutes")).intValue()
        );
    }

    @PatchMapping("/{id:\\d+}")
    public StudyGoal patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return studyGoalService.partialUpdate(
                id,
                longValue(body.get("subjectId")),
                body.containsKey("subjectId"),
                body.get("period") != null ? GoalPeriod.valueOf((String) body.get("period")) : null,
                body.get("targetMinutes") != null ? ((Number) body.get("targetMinutes")).intValue() : null
        );
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studyGoalService.delete(id);
        return ResponseEntity.ok().build();
    }

    private Long longValue(Object value) {
        return value != null ? ((Number) value).longValue() : null;
    }
}
