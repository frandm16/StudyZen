package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.dto.notification.NotificationCreateRequest;
import com.frandm.studytracker.backend.dto.notification.NotificationResponse;
import com.frandm.studytracker.backend.model.Notification;
import com.frandm.studytracker.backend.repository.NotificationRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class NotificationService {

    private static final int MAX_LIMIT = 100;
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(int limit) {
        int boundedLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
        return notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(
                        CurrentUser.id(), PageRequest.of(0, boundedLimit))
                .stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository.countByUserIdAndReadFalse(CurrentUser.id());
    }

    @Transactional
    public NotificationResponse create(NotificationCreateRequest request) {
        Notification notification = new Notification();
        notification.setUserId(CurrentUser.id());
        notification.setType(request.type());
        notification.setTitle(request.title().trim());
        notification.setBody(request.body().trim());
        notification.setRead(false);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification notification = findOwned(id);
        notification.setRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllRead() {
        return notificationRepository.markAllRead(CurrentUser.id());
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.delete(findOwned(id));
    }

    private Notification findOwned(Long id) {
        UUID userId = CurrentUser.id();
        return notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Notification not found: " + id));
    }
}
