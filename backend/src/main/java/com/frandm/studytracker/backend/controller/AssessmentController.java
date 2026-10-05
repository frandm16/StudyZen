package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.Assessment;
import com.frandm.studytracker.backend.model.enums.AssessmentType;
import com.frandm.studytracker.backend.service.AssessmentService;
import com.frandm.studytracker.backend.util.DateTimeUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @GetMapping
    public List<Assessment> list(@RequestParam(required = false) Long subjectId) {
        return assessmentService.getAll(subjectId);
    }

    @GetMapping("/{id:\\d+}")
    public Assessment get(@PathVariable Long id) {
        return assessmentService.getById(id);
    }

    @PostMapping
    public Assessment create(@RequestBody Map<String, Object> body) {
        return assessmentService.create(
                longValue(body.get("subjectId")),
                type(body.get("type")),
                (String) body.get("title"),
                (String) body.get("description"),
                decimal(body.get("grade")),
                decimal(body.get("maxGrade")),
                decimal(body.get("weightPercent")),
                DateTimeUtils.parseFlexibleOffset((String) body.get("dueAt")),
                (Boolean) body.get("isCompleted")
        );
    }

    @PutMapping("/{id:\\d+}")
    public Assessment update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return assessmentService.fullUpdate(
                id,
                longValue(body.get("subjectId")),
                type(body.get("type")),
                (String) body.get("title"),
                (String) body.get("description"),
                decimal(body.get("grade")),
                decimal(body.get("maxGrade")),
                decimal(body.get("weightPercent")),
                DateTimeUtils.parseFlexibleOffset((String) body.get("dueAt")),
                (Boolean) body.get("isCompleted")
        );
    }

    @PatchMapping("/{id:\\d+}")
    public Assessment patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return assessmentService.partialUpdate(
                id,
                longValue(body.get("subjectId")),
                type(body.get("type")),
                (String) body.get("title"),
                (String) body.get("description"),
                decimal(body.get("grade")),
                decimal(body.get("maxGrade")),
                decimal(body.get("weightPercent")),
                body.containsKey("dueAt")
                        ? DateTimeUtils.parseFlexibleOffset(body.get("dueAt") != null ? body.get("dueAt").toString() : null)
                        : null,
                (Boolean) body.get("isCompleted"),
                body.containsKey("dueAt")
        );
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assessmentService.delete(id);
        return ResponseEntity.ok().build();
    }

    private Long longValue(Object value) {
        return value != null ? ((Number) value).longValue() : null;
    }

    private BigDecimal decimal(Object value) {
        return value != null ? new BigDecimal(value.toString()) : null;
    }

    private AssessmentType type(Object value) {
        return value != null ? AssessmentType.valueOf((String) value) : null;
    }
}
