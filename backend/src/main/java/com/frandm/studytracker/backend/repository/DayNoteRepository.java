package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.DayNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DayNoteRepository extends JpaRepository<DayNote, Long> {
    List<DayNote> findByUserIdOrderByDateDesc(UUID userId);
    Optional<DayNote> findByIdAndUserId(Long id, UUID userId);
    Optional<DayNote> findByUserIdAndDate(UUID userId, LocalDate date);
}
