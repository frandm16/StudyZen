package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.ScheduledSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduledSessionRepository extends JpaRepository<ScheduledSession, Long> {

    Optional<ScheduledSession> findByIdAndUserId(Long id, UUID userId);

    List<ScheduledSession> findByUserIdOrderByStartsAtAsc(UUID userId);

    @Query("SELECT s FROM ScheduledSession s WHERE s.userId = :userId " +
            "AND s.startsAt BETWEEN :start AND :end ORDER BY s.startsAt ASC")
    List<ScheduledSession> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );
}
