package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByUserIdOrderByDueAtAsc(UUID userId);
    List<Assessment> findByUserIdAndSubjectIdOrderByDueAtAsc(UUID userId, Long subjectId);
    Optional<Assessment> findByIdAndUserId(Long id, UUID userId);

    @Query(value = "SELECT * FROM assessments a WHERE a.due_at IS NOT NULL AND a.is_completed = FALSE AND (LOWER(CAST(a.type AS text)) LIKE '%exam%' OR LOWER(CAST(a.type AS text)) LIKE '%midterm%') AND (a.due_at AT TIME ZONE 'UTC')::date BETWEEN :fromDate AND :throughDate", nativeQuery = true)
    List<Assessment> findReminderCandidates(@Param("fromDate") LocalDate fromDate, @Param("throughDate") LocalDate throughDate);
}
