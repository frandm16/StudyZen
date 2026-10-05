package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.DayNote;
import com.frandm.studytracker.backend.repository.DayNoteRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DayNoteService {

    private final DayNoteRepository dayNoteRepository;

    public DayNoteService(DayNoteRepository dayNoteRepository) {
        this.dayNoteRepository = dayNoteRepository;
    }

    public List<DayNote> list() {
        UUID userId = CurrentUser.id();
        return dayNoteRepository.findByUserIdOrderByDateDesc(userId);
    }

    public DayNote getById(Long id) {
        UUID userId = CurrentUser.id();
        return dayNoteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("DayNote not found: " + id));
    }

    public DayNote getOrEmpty(LocalDate date) {
        UUID userId = CurrentUser.id();
        return dayNoteRepository.findByUserIdAndDate(userId, date).orElseGet(() -> {
            DayNote empty = new DayNote();
            empty.setDate(date);
            empty.setContent("");
            return empty;
        });
    }

    public DayNote create(Map<String, Object> body) {
        UUID userId = CurrentUser.id();
        LocalDate date = LocalDate.parse((String) body.get("date"));
        String content = (String) body.get("content");

        // Return existing note for this date if one exists, only updating if absent
        return dayNoteRepository.findByUserIdAndDate(userId, date).orElseGet(() -> {
            DayNote note = new DayNote();
            note.setUserId(userId);
            note.setDate(date);
            note.setContent(content != null ? content : "");
            note.setUpdatedAt(OffsetDateTime.now());
            return dayNoteRepository.save(note);
        });
    }

    public DayNote fullUpdate(Long id, Map<String, Object> body) {
        UUID userId = CurrentUser.id();
        DayNote note = dayNoteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("DayNote not found: " + id));

        LocalDate date = LocalDate.parse((String) body.get("date"));
        String content = (String) body.get("content");

        note.setDate(date);
        note.setContent(content != null ? content : "");
        note.setUpdatedAt(OffsetDateTime.now());

        return dayNoteRepository.save(note);
    }

    public DayNote partialUpdate(Long id, Map<String, Object> body) {
        UUID userId = CurrentUser.id();
        DayNote note = dayNoteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("DayNote not found: " + id));

        if (body.containsKey("content")) {
            String content = (String) body.get("content");
            note.setContent(content != null ? content : "");
        }

        note.setUpdatedAt(OffsetDateTime.now());
        return dayNoteRepository.save(note);
    }

    public void delete(Long id) {
        UUID userId = CurrentUser.id();
        DayNote note = dayNoteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("DayNote not found: " + id));
        dayNoteRepository.delete(note);
    }
}
