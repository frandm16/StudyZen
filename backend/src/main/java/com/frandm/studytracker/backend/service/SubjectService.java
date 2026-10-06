package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.AcademicTerm;
import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.repository.AcademicTermRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final AcademicTermRepository academicTermRepository;

    public SubjectService(SubjectRepository subjectRepository, AcademicTermRepository academicTermRepository) {
        this.subjectRepository = subjectRepository;
        this.academicTermRepository = academicTermRepository;
    }

    public List<Subject> getActive(Long termId) {
        UUID userId = CurrentUser.id();
        if (termId != null) {
            return subjectRepository.findByUserIdAndTermIdOrderByNameAsc(userId, termId);
        }
        return subjectRepository.findByUserIdAndIsArchivedFalseOrderByNameAsc(userId);
    }

    public List<Subject> getAll() {
        return subjectRepository.findByUserIdOrderByNameAsc(CurrentUser.id());
    }

    public List<Subject> getFavorites() {
        return subjectRepository.findByUserIdAndIsArchivedFalseAndIsFavoriteTrueOrderByNameAsc(CurrentUser.id());
    }

    public Subject getById(Long id) {
        return subjectRepository.findByIdAndUserId(id, CurrentUser.id())
                .orElseThrow(() -> new RuntimeException("Subject not found: " + id));
    }

    public Subject create(String name, Long termId, String color, String notes, Boolean isArchived, Boolean isFavorite) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Subject name is required");
        }
        UUID userId = CurrentUser.id();
        Long resolvedTermId = resolveOrCreateTerm(termId, userId);
        String trimmedName = name.trim();
        rejectDuplicate(resolvedTermId, trimmedName, null);
        Subject subject = new Subject();
        subject.setUserId(userId);
        subject.setCreatedAt(OffsetDateTime.now());
        subject.setName(trimmedName);
        subject.setTermId(resolvedTermId);
        subject.setColor(color != null && !color.isBlank() ? color : "#4287f5");
        subject.setNotes(notes);
        subject.setArchived(Boolean.TRUE.equals(isArchived));
        subject.setFavorite(Boolean.TRUE.equals(isFavorite));
        subject.setUpdatedAt(OffsetDateTime.now());
        return subjectRepository.save(subject);
    }

    public Subject fullUpdate(Long id, String name, Long termId, String color, String notes, Boolean isArchived, Boolean isFavorite) {
        Subject subject = getById(id);
        requireTerm(termId);
        rejectDuplicate(termId, name, subject.getId());
        subject.setName(name);
        subject.setTermId(termId);
        subject.setColor(color);
        subject.setNotes(notes);
        subject.setArchived(Boolean.TRUE.equals(isArchived));
        subject.setFavorite(Boolean.TRUE.equals(isFavorite));
        subject.setUpdatedAt(OffsetDateTime.now());
        return subjectRepository.save(subject);
    }

    public Subject partialUpdate(Long id, String name, Long termId, String color, String notes, Boolean isArchived, Boolean isFavorite) {
        Subject subject = getById(id);
        Long nextTermId = termId != null ? termId : subject.getTermId();
        String nextName = name != null ? name : subject.getName();
        if (termId != null) {
            requireTerm(termId);
        }
        if (name != null || termId != null) {
            rejectDuplicate(nextTermId, nextName, subject.getId());
        }
        if (name != null) subject.setName(name);
        if (termId != null) subject.setTermId(termId);
        if (color != null) subject.setColor(color);
        if (notes != null) subject.setNotes(notes);
        if (isArchived != null) subject.setArchived(isArchived);
        if (isFavorite != null) subject.setFavorite(isFavorite);
        subject.setUpdatedAt(OffsetDateTime.now());
        return subjectRepository.save(subject);
    }

    public void delete(Long id) {
        Subject subject = getById(id);
        subjectRepository.delete(subject);
    }

    private Long resolveOrCreateTerm(Long termId, UUID userId) {
        if (termId != null) {
            requireTerm(termId);
            return termId;
        }
        return academicTermRepository.findByUserIdAndIsCurrentTrue(userId)
                .map(AcademicTerm::getId)
                .or(() -> academicTermRepository.findByUserIdAndIsArchivedFalseOrderByStartDateDesc(userId).stream().findFirst().map(AcademicTerm::getId))
                .orElseGet(() -> {
                    AcademicTerm defaultTerm = new AcademicTerm();
                    defaultTerm.setUserId(userId);
                    defaultTerm.setName("General");
                    defaultTerm.setStartDate(LocalDate.now());
                    defaultTerm.setEndDate(LocalDate.now().plusYears(1));
                    defaultTerm.setCurrent(true);
                    defaultTerm.setArchived(false);
                    defaultTerm.setCreatedAt(OffsetDateTime.now());
                    defaultTerm.setUpdatedAt(OffsetDateTime.now());
                    return academicTermRepository.save(defaultTerm).getId();
                });
    }

    private void requireTerm(Long termId) {
        if (termId == null || academicTermRepository.findByIdAndUserId(termId, CurrentUser.id()).isEmpty()) {
            throw new RuntimeException("AcademicTerm not found: " + termId);
        }
    }

    private void rejectDuplicate(Long termId, String name, Long exceptId) {
        subjectRepository.findByUserIdAndTermIdAndName(CurrentUser.id(), termId, name).ifPresent(existing -> {
            if (exceptId == null || !exceptId.equals(existing.getId())) {
                throw new RuntimeException("Subject already exists: " + name);
            }
        });
    }
}
