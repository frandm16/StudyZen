package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.AcademicTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AcademicTermRepository extends JpaRepository<AcademicTerm, Long> {
    List<AcademicTerm> findByUserIdOrderByStartDateDesc(UUID userId);
    List<AcademicTerm> findByUserIdAndIsArchivedFalseOrderByStartDateDesc(UUID userId);
    Optional<AcademicTerm> findByIdAndUserId(Long id, UUID userId);
    Optional<AcademicTerm> findByUserIdAndIsCurrentTrue(UUID userId);
}
