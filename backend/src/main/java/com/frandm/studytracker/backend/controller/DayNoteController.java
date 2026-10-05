package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.DayNote;
import com.frandm.studytracker.backend.service.DayNoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin
public class DayNoteController {

    private final DayNoteService dayNoteService;

    public DayNoteController(DayNoteService dayNoteService) {
        this.dayNoteService = dayNoteService;
    }

    @GetMapping
    public List<DayNote> list() {
        return dayNoteService.list();
    }

    @GetMapping("/{id}")
    public DayNote get(@PathVariable Long id) {
        return dayNoteService.getById(id);
    }

    @PostMapping
    public DayNote create(@RequestBody Map<String, Object> body) {
        return dayNoteService.create(body);
    }

    @PutMapping("/{id}")
    public DayNote update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return dayNoteService.fullUpdate(id, body);
    }

    @PatchMapping("/{id}")
    public DayNote patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return dayNoteService.partialUpdate(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dayNoteService.delete(id);
        return ResponseEntity.ok().build();
    }
}
