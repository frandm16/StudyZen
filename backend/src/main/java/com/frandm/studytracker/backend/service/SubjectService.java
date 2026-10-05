package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.repository.AcademicTermRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;

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
        requireTerm(termId);
        rejectDuplicate(termId, name, null);
        Subject subject = new Subject();
        subject.setUserId(CurrentUser.id());
        subject.setCreatedAt(OffsetDateTime.now());
        subject.setName(name);
        subject.setTermId(termId);
        subject.setColor(color);
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
