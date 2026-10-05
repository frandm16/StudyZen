package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.StudyGoal;
import com.frandm.studytracker.backend.model.enums.GoalPeriod;
import com.frandm.studytracker.backend.repository.StudyGoalRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StudyGoalService {

    private final StudyGoalRepository studyGoalRepository;
    private final SubjectRepository subjectRepository;

    public StudyGoalService(StudyGoalRepository studyGoalRepository, SubjectRepository subjectRepository) {
        this.studyGoalRepository = studyGoalRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<StudyGoal> getAll() {
        return studyGoalRepository.findByUserIdOrderByPeriodAsc(CurrentUser.id());
    }

    public StudyGoal getById(Long id) {
        return studyGoalRepository.findByIdAndUserId(id, CurrentUser.id())
                .orElseThrow(() -> new RuntimeException("StudyGoal not found: " + id));
    }

    public StudyGoal create(Long subjectId, GoalPeriod period, int targetMinutes) {
        if (subjectId != null) {
            requireSubject(subjectId);
        }
        Optional<StudyGoal> existing = findExisting(CurrentUser.id(), subjectId, period);
        if (existing.isPresent()) {
            StudyGoal goal = existing.get();
            goal.setTargetMinutes(targetMinutes);
            goal.setUpdatedAt(OffsetDateTime.now());
            return studyGoalRepository.save(goal);
        }
        StudyGoal goal = new StudyGoal();
        goal.setUserId(CurrentUser.id());
        goal.setCreatedAt(OffsetDateTime.now());
        goal.setSubjectId(subjectId);
        goal.setPeriod(period);
        goal.setTargetMinutes(targetMinutes);
        goal.setUpdatedAt(OffsetDateTime.now());
        return studyGoalRepository.save(goal);
    }

    public StudyGoal fullUpdate(Long id, Long subjectId, GoalPeriod period, int targetMinutes) {
        StudyGoal goal = getById(id);
        if (subjectId != null) {
            requireSubject(subjectId);
        }
        goal.setSubjectId(subjectId);
        goal.setPeriod(period);
        goal.setTargetMinutes(targetMinutes);
        goal.setUpdatedAt(OffsetDateTime.now());
        return studyGoalRepository.save(goal);
    }

    public StudyGoal partialUpdate(Long id, Long subjectId, boolean subjectIdPresent, GoalPeriod period, Integer targetMinutes) {
        StudyGoal goal = getById(id);
        if (subjectIdPresent) {
            if (subjectId != null) {
                requireSubject(subjectId);
            }
            goal.setSubjectId(subjectId);
        }
        if (period != null) goal.setPeriod(period);
        if (targetMinutes != null) goal.setTargetMinutes(targetMinutes);
        goal.setUpdatedAt(OffsetDateTime.now());
        return studyGoalRepository.save(goal);
    }

    public void delete(Long id) {
        StudyGoal goal = getById(id);
        studyGoalRepository.delete(goal);
    }

    private Optional<StudyGoal> findExisting(UUID userId, Long subjectId, GoalPeriod period) {
        if (subjectId == null) {
            return studyGoalRepository.findByUserIdAndSubjectIdIsNullAndPeriod(userId, period);
        }
        return studyGoalRepository.findByUserIdAndSubjectIdAndPeriod(userId, subjectId, period);
    }

    private void requireSubject(Long subjectId) {
        if (subjectRepository.findByIdAndUserId(subjectId, CurrentUser.id()).isEmpty()) {
            throw new RuntimeException("Subject not found: " + subjectId);
        }
    }
}
