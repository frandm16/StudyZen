package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.dto.notification.NotificationCreateRequest;
import com.frandm.studytracker.backend.dto.notification.NotificationResponse;
import com.frandm.studytracker.backend.dto.notification.UnreadCountResponse;
import com.frandm.studytracker.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> list(
            @RequestParam(defaultValue = "50") int limit) {
        return notificationService.list(limit);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount() {
        return new UnreadCountResponse(notificationService.unreadCount());
    }

    @PostMapping
    public NotificationResponse create(@Valid @RequestBody NotificationCreateRequest request) {
        return notificationService.create(request);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id) {
        return notificationService.markRead(id);
    }

    @PostMapping("/read-all")
    public Map<String, Integer> markAllRead() {
        return Map.of("updatedCount", notificationService.markAllRead());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
