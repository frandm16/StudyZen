package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByUserIdOrderByNameAsc(UUID userId);
    List<Subject> findByUserIdAndIsArchivedFalseOrderByNameAsc(UUID userId);
    List<Subject> findByUserIdAndIsArchivedFalseAndIsFavoriteTrueOrderByNameAsc(UUID userId);
    List<Subject> findByUserIdAndTermIdOrderByNameAsc(UUID userId, Long termId);
    Optional<Subject> findByIdAndUserId(Long id, UUID userId);
    Optional<Subject> findByUserIdAndTermIdAndName(UUID userId, Long termId, String name);
}
