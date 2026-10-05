package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.StudyGoal;
import com.frandm.studytracker.backend.model.enums.GoalPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudyGoalRepository extends JpaRepository<StudyGoal, Long> {
    List<StudyGoal> findByUserIdOrderByPeriodAsc(UUID userId);
    Optional<StudyGoal> findByIdAndUserId(Long id, UUID userId);
    Optional<StudyGoal> findByUserIdAndSubjectIdIsNullAndPeriod(UUID userId, GoalPeriod period);
    Optional<StudyGoal> findByUserIdAndSubjectIdAndPeriod(UUID userId, Long subjectId, GoalPeriod period);
}
