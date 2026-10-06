package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.AcademicTerm;
import com.frandm.studytracker.backend.service.AcademicTermService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/terms")
public class AcademicTermController {

    private final AcademicTermService academicTermService;

    public AcademicTermController(AcademicTermService academicTermService) {
        this.academicTermService = academicTermService;
    }

    @GetMapping
    public List<AcademicTerm> list() {
        return academicTermService.getActive();
    }

    @GetMapping("/all")
    public List<AcademicTerm> listAll() {
        return academicTermService.getAll();
    }

    @GetMapping("/{id:\\d+}")
    public AcademicTerm get(@PathVariable Long id) {
        return academicTermService.getById(id);
    }

    @PostMapping
    public AcademicTerm create(@RequestBody Map<String, Object> body) {
        return academicTermService.create(
                (String) body.get("name"),
                parseDate(body.get("startDate")),
                parseDate(body.get("endDate")),
                parseBoolean(body.get("isCurrent"), body.get("current")),
                parseBoolean(body.get("isArchived"), body.get("archived"))
        );
    }

    @PutMapping("/{id:\\d+}")
    public AcademicTerm update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return academicTermService.fullUpdate(
                id,
                (String) body.get("name"),
                parseDate(body.get("startDate")),
                parseDate(body.get("endDate")),
                parseBoolean(body.get("isCurrent"), body.get("current")),
                parseBoolean(body.get("isArchived"), body.get("archived"))
        );
    }

    @PatchMapping("/{id:\\d+}")
    public AcademicTerm patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return academicTermService.partialUpdate(
                id,
                (String) body.get("name"),
                parseDate(body.get("startDate")),
                parseDate(body.get("endDate")),
                parseBoolean(body.get("isCurrent"), body.get("current")),
                parseBoolean(body.get("isArchived"), body.get("archived"))
        );
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        academicTermService.delete(id);
        return ResponseEntity.ok().build();
    }

    private LocalDate parseDate(Object value) {
        return value != null ? LocalDate.parse((String) value) : null;
    }

    private Boolean parseBoolean(Object v1, Object v2) {
        Object val = v1 != null ? v1 : v2;
        if (val instanceof Boolean b) return b;
        if (val instanceof String s) return Boolean.parseBoolean(s);
        return null;
    }
}
