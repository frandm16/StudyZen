package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.AcademicTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AcademicTermRepository extends JpaRepository<AcademicTerm, Long> {
    List<AcademicTerm> findByUserIdOrderByStartDateDesc(UUID userId);
    List<AcademicTerm> findByUserIdAndIsArchivedFalseOrderByStartDateDesc(UUID userId);
    Optional<AcademicTerm> findByIdAndUserId(Long id, UUID userId);
    Optional<AcademicTerm> findFirstByUserIdAndIsCurrentTrueOrderByStartDateDesc(UUID userId);
    List<AcademicTerm> findAllByUserIdAndIsCurrentTrue(UUID userId);

    @Modifying
    @Query("UPDATE AcademicTerm t SET t.isCurrent = false, t.updatedAt = CURRENT_TIMESTAMP WHERE t.userId = :userId AND (:exceptId IS NULL OR t.id <> :exceptId)")
    void clearCurrentTerms(@Param("userId") UUID userId, @Param("exceptId") Long exceptId);
}
