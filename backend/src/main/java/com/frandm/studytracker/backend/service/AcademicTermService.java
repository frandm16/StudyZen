package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.AcademicTerm;
import com.frandm.studytracker.backend.repository.AcademicTermRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AcademicTermService {

    private final AcademicTermRepository academicTermRepository;

    public AcademicTermService(AcademicTermRepository academicTermRepository) {
        this.academicTermRepository = academicTermRepository;
    }

    public List<AcademicTerm> getActive() {
        return academicTermRepository.findByUserIdAndIsArchivedFalseOrderByStartDateDesc(CurrentUser.id());
    }

    public List<AcademicTerm> getAll() {
        return academicTermRepository.findByUserIdOrderByStartDateDesc(CurrentUser.id());
    }

    public AcademicTerm getById(Long id) {
        return academicTermRepository.findByIdAndUserId(id, CurrentUser.id())
                .orElseThrow(() -> new RuntimeException("AcademicTerm not found: " + id));
    }

    public AcademicTerm create(String name, LocalDate startDate, LocalDate endDate, Boolean isCurrent, Boolean isArchived) {
        AcademicTerm term = new AcademicTerm();
        term.setUserId(CurrentUser.id());
        term.setCreatedAt(OffsetDateTime.now());
        term.setName(name);
        term.setStartDate(startDate);
        term.setEndDate(endDate);
        boolean current = Boolean.TRUE.equals(isCurrent);
        if (current) {
            clearCurrentTerm(null);
        }
        term.setCurrent(current);
        term.setArchived(Boolean.TRUE.equals(isArchived));
        term.setUpdatedAt(OffsetDateTime.now());
        return academicTermRepository.save(term);
    }

    public AcademicTerm fullUpdate(Long id, String name, LocalDate startDate, LocalDate endDate, Boolean isCurrent, Boolean isArchived) {
        AcademicTerm term = getById(id);
        term.setName(name);
        term.setStartDate(startDate);
        term.setEndDate(endDate);
        boolean current = Boolean.TRUE.equals(isCurrent);
        if (current) {
            clearCurrentTerm(term.getId());
        }
        term.setCurrent(current);
        term.setArchived(Boolean.TRUE.equals(isArchived));
        term.setUpdatedAt(OffsetDateTime.now());
        return academicTermRepository.save(term);
    }

    public AcademicTerm partialUpdate(Long id, String name, LocalDate startDate, LocalDate endDate, Boolean isCurrent, Boolean isArchived) {
        AcademicTerm term = getById(id);
        if (name != null) term.setName(name);
        if (startDate != null) term.setStartDate(startDate);
        if (endDate != null) term.setEndDate(endDate);
        if (Boolean.TRUE.equals(isCurrent)) {
            clearCurrentTerm(term.getId());
        }
        if (isCurrent != null) term.setCurrent(isCurrent);
        if (isArchived != null) term.setArchived(isArchived);
        term.setUpdatedAt(OffsetDateTime.now());
        return academicTermRepository.save(term);
    }

    public void delete(Long id) {
        AcademicTerm term = getById(id);
        academicTermRepository.delete(term);
    }

    private void clearCurrentTerm(Long exceptId) {
        UUID userId = CurrentUser.id();
        academicTermRepository.findByUserIdAndIsCurrentTrue(userId).ifPresent(current -> {
            if (exceptId == null || !exceptId.equals(current.getId())) {
                current.setCurrent(false);
                current.setUpdatedAt(OffsetDateTime.now());
                academicTermRepository.save(current);
            }
        });
    }
}
