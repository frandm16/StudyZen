package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByUserIdOrderByDueAtAsc(UUID userId);
    List<Assessment> findByUserIdAndSubjectIdOrderByDueAtAsc(UUID userId, Long subjectId);
    Optional<Assessment> findByIdAndUserId(Long id, UUID userId);
}
