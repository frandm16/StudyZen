package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByUserIdOrderBySortOrderAscNameAsc(UUID userId);
    List<Topic> findByUserIdAndSubjectIdOrderBySortOrderAscNameAsc(UUID userId, Long subjectId);
    Optional<Topic> findByIdAndUserId(Long id, UUID userId);
    Optional<Topic> findByUserIdAndSubjectIdAndName(UUID userId, Long subjectId, String name);
}
