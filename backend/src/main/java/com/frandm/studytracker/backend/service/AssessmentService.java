package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Assessment;
import com.frandm.studytracker.backend.model.enums.AssessmentType;
import com.frandm.studytracker.backend.repository.AssessmentRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final SubjectRepository subjectRepository;

    public AssessmentService(AssessmentRepository assessmentRepository, SubjectRepository subjectRepository) {
        this.assessmentRepository = assessmentRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<Assessment> getAll(Long subjectId) {
        if (subjectId != null) {
            return assessmentRepository.findByUserIdAndSubjectIdOrderByDueAtAsc(CurrentUser.id(), subjectId);
        }
        return assessmentRepository.findByUserIdOrderByDueAtAsc(CurrentUser.id());
    }

    public Assessment getById(Long id) {
        return assessmentRepository.findByIdAndUserId(id, CurrentUser.id())
                .orElseThrow(() -> new RuntimeException("Assessment not found: " + id));
    }

    public Assessment create(Long subjectId, AssessmentType type, String title, String description,
                             BigDecimal grade, BigDecimal maxGrade, BigDecimal weightPercent,
                             OffsetDateTime dueAt, Boolean isCompleted) {
        requireSubject(subjectId);
        Assessment assessment = new Assessment();
        assessment.setUserId(CurrentUser.id());
        assessment.setCreatedAt(OffsetDateTime.now());
        assessment.setSubjectId(subjectId);
        assessment.setType(type != null ? type : AssessmentType.other);
        assessment.setTitle(title);
        assessment.setDescription(description);
        assessment.setGrade(grade);
        assessment.setMaxGrade(maxGrade);
        assessment.setWeightPercent(weightPercent);
        assessment.setDueAt(dueAt);
        boolean completed = Boolean.TRUE.equals(isCompleted);
        assessment.setCompleted(completed);
        assessment.setCompletedAt(completed ? OffsetDateTime.now() : null);
        assessment.setUpdatedAt(OffsetDateTime.now());
        return assessmentRepository.save(assessment);
    }

    public Assessment fullUpdate(Long id, Long subjectId, AssessmentType type, String title, String description,
                                 BigDecimal grade, BigDecimal maxGrade, BigDecimal weightPercent,
                                 OffsetDateTime dueAt, Boolean isCompleted) {
        Assessment assessment = getById(id);
        requireSubject(subjectId);
        assessment.setSubjectId(subjectId);
        assessment.setType(type != null ? type : AssessmentType.other);
        assessment.setTitle(title);
        assessment.setDescription(description);
        assessment.setGrade(grade);
        assessment.setMaxGrade(maxGrade);
        assessment.setWeightPercent(weightPercent);
        assessment.setDueAt(dueAt);
        applyCompleted(assessment, Boolean.TRUE.equals(isCompleted));
        assessment.setUpdatedAt(OffsetDateTime.now());
        return assessmentRepository.save(assessment);
    }

    public Assessment partialUpdate(Long id, Long subjectId, AssessmentType type, String title, String description,
                                    BigDecimal grade, BigDecimal maxGrade, BigDecimal weightPercent,
                                    OffsetDateTime dueAt, Boolean isCompleted, boolean dueAtPresent) {
        Assessment assessment = getById(id);
        if (subjectId != null) {
            requireSubject(subjectId);
            assessment.setSubjectId(subjectId);
        }
        if (type != null) assessment.setType(type);
        if (title != null) assessment.setTitle(title);
        if (description != null) assessment.setDescription(description);
        if (grade != null) assessment.setGrade(grade);
        if (maxGrade != null) assessment.setMaxGrade(maxGrade);
        if (weightPercent != null) assessment.setWeightPercent(weightPercent);
        if (dueAtPresent) assessment.setDueAt(dueAt);
        if (isCompleted != null) applyCompleted(assessment, isCompleted);
        assessment.setUpdatedAt(OffsetDateTime.now());
        return assessmentRepository.save(assessment);
    }

    public void delete(Long id) {
        Assessment assessment = getById(id);
        assessmentRepository.delete(assessment);
    }

    private void applyCompleted(Assessment assessment, boolean completed) {
        if (completed && assessment.getCompletedAt() == null) {
            assessment.setCompletedAt(OffsetDateTime.now());
        } else if (!completed) {
            assessment.setCompletedAt(null);
        }
        assessment.setCompleted(completed);
    }

    private void requireSubject(Long subjectId) {
        if (subjectId == null || subjectRepository.findByIdAndUserId(subjectId, CurrentUser.id()).isEmpty()) {
            throw new RuntimeException("Subject not found: " + subjectId);
        }
    }
}
