package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.service.SubjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public List<Subject> list(@RequestParam(required = false) Long termId) {
        return subjectService.getActive(termId);
    }

    @GetMapping("/all")
    public List<Subject> listAll() {
        return subjectService.getAll();
    }

    @GetMapping("/favorites")
    public List<Subject> listFavorites() {
        return subjectService.getFavorites();
    }

    @GetMapping("/{id:\\d+}")
    public Subject get(@PathVariable Long id) {
        return subjectService.getById(id);
    }

    @PostMapping
    public Subject create(@RequestBody Map<String, Object> body) {
        return subjectService.create(
                (String) body.get("name"),
                longValue(body.get("termId")),
                (String) body.get("color"),
                (String) body.get("notes"),
                parseBoolean(body.get("isArchived"), body.get("archived")),
                parseBoolean(body.get("isFavorite"), body.get("favorite"))
        );
    }

    @PutMapping("/{id:\\d+}")
    public Subject update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return subjectService.fullUpdate(
                id,
                (String) body.get("name"),
                longValue(body.get("termId")),
                (String) body.get("color"),
                (String) body.get("notes"),
                parseBoolean(body.get("isArchived"), body.get("archived")),
                parseBoolean(body.get("isFavorite"), body.get("favorite"))
        );
    }

    @PatchMapping("/{id:\\d+}")
    public Subject patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return subjectService.partialUpdate(
                id,
                (String) body.get("name"),
                longValue(body.get("termId")),
                (String) body.get("color"),
                (String) body.get("notes"),
                parseBoolean(body.get("isArchived"), body.get("archived")),
                parseBoolean(body.get("isFavorite"), body.get("favorite"))
        );
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subjectService.delete(id);
        return ResponseEntity.ok().build();
    }

    private Long longValue(Object value) {
        return value != null ? ((Number) value).longValue() : null;
    }

    private Boolean parseBoolean(Object v1, Object v2) {
        Object val = v1 != null ? v1 : v2;
        if (val instanceof Boolean b) return b;
        if (val instanceof String s) return Boolean.parseBoolean(s);
        return null;
    }
}
