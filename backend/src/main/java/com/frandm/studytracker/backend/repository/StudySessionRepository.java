package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    Optional<StudySession> findByIdAndUserId(Long id, UUID userId);

    List<StudySession> findByUserIdOrderByStartedAtDesc(UUID userId);

    List<StudySession> findByUserIdAndTopicIdOrderByStartedAtDesc(UUID userId, Long topicId);

    @Query("SELECT s FROM StudySession s WHERE s.userId = :userId " +
            "AND s.startedAt BETWEEN :start AND :end ORDER BY s.startedAt DESC")
    List<StudySession> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );
}
