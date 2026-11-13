package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.Deadline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeadlineRepository extends JpaRepository<Deadline, Long> {

    Optional<Deadline> findByIdAndUserId(Long id, UUID userId);

    List<Deadline> findByUserIdOrderByDueAtAsc(UUID userId);

    @Query("SELECT d FROM Deadline d WHERE d.userId = :userId " +
            "AND d.dueAt BETWEEN :start AND :end ORDER BY d.dueAt ASC")
    List<Deadline> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );

    @Query(value = "SELECT * FROM deadlines d WHERE d.due_at IS NOT NULL AND d.is_completed = FALSE " +
            "AND d.due_at BETWEEN :from AND :to", nativeQuery = true)
    List<Deadline> findReminderCandidates(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);
}
