package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.TodoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {
    List<TodoItem> findByUserIdOrderByIdAsc(UUID userId);
    List<TodoItem> findByUserIdAndDateOrderByIdAsc(UUID userId, LocalDate date);
    Optional<TodoItem> findByIdAndUserId(Long id, UUID userId);
}
