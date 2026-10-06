package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.AcademicTerm;
import com.frandm.studytracker.backend.repository.AcademicTermRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import jakarta.transaction.Transactional;
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

    @Transactional
    public AcademicTerm create(String name, LocalDate startDate, LocalDate endDate, Boolean isCurrent, Boolean isArchived) {
        if (name == null || name.trim().isBlank()) {
            throw new IllegalArgumentException("Term name is required");
        }
        if (startDate == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        if (endDate == null) {
            throw new IllegalArgumentException("End date is required");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be on or after start date");
        }
        boolean current = Boolean.TRUE.equals(isCurrent);
        if (current) {
            clearCurrentTerm(null);
        }
        AcademicTerm term = new AcademicTerm();
        term.setUserId(CurrentUser.id());
        term.setCreatedAt(OffsetDateTime.now());
        term.setName(name.trim());
        term.setStartDate(startDate);
        term.setEndDate(endDate);
        term.setCurrent(current);
        term.setArchived(Boolean.TRUE.equals(isArchived));
        term.setUpdatedAt(OffsetDateTime.now());
        return academicTermRepository.save(term);
    }

    @Transactional
    public AcademicTerm fullUpdate(Long id, String name, LocalDate startDate, LocalDate endDate, Boolean isCurrent, Boolean isArchived) {
        AcademicTerm term = getById(id);
        boolean current = Boolean.TRUE.equals(isCurrent);
        if (current) {
            clearCurrentTerm(term.getId());
        }
        term.setName(name);
        term.setStartDate(startDate);
        term.setEndDate(endDate);
        term.setCurrent(current);
        term.setArchived(Boolean.TRUE.equals(isArchived));
        term.setUpdatedAt(OffsetDateTime.now());
        return academicTermRepository.save(term);
    }

    @Transactional
    public AcademicTerm partialUpdate(Long id, String name, LocalDate startDate, LocalDate endDate, Boolean isCurrent, Boolean isArchived) {
        AcademicTerm term = getById(id);
        if (name != null) term.setName(name.trim());
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

    @Transactional
    public void delete(Long id) {
        AcademicTerm term = getById(id);
        academicTermRepository.delete(term);
    }

    private void clearCurrentTerm(Long exceptId) {
        UUID userId = CurrentUser.id();
        academicTermRepository.findAllByUserIdAndIsCurrentTrue(userId).forEach(current -> {
            if (exceptId == null || !exceptId.equals(current.getId())) {
                current.setCurrent(false);
                current.setUpdatedAt(OffsetDateTime.now());
                academicTermRepository.save(current);
            }
        });
    }
}
