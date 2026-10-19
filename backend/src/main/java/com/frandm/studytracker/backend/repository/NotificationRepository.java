package com.frandm.studytracker.backend.repository;

import com.frandm.studytracker.backend.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDescIdDesc(UUID userId, Pageable pageable);
    Optional<Notification> findByIdAndUserId(Long id, UUID userId);
    long countByUserIdAndReadFalse(UUID userId);
    @Modifying
    @Query(value = "INSERT INTO notifications (user_id, type, title, body, is_read, reminder_key) VALUES (:userId, 'warning', :title, :body, FALSE, :reminderKey) ON CONFLICT (reminder_key) WHERE reminder_key IS NOT NULL DO NOTHING", nativeQuery = true)
    int insertExamReminder(@Param("userId") UUID userId, @Param("title") String title, @Param("body") String body, @Param("reminderKey") String reminderKey);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    int markAllRead(@Param("userId") UUID userId);
}
