package com.frandm.studytracker.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "study_sessions")
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    @Column(name = "scheduled_session_id")
    private Long scheduledSessionId;

    private String title;

    private String description;

    @Column(name = "total_minutes", nullable = false)
    private int totalMinutes;

    @Column(name = "paused_minutes", nullable = false)
    private int pausedMinutes = 0;

    @Column(name = "focus_rating")
    private Short focusRating;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "ended_at", nullable = false)
    private OffsetDateTime endedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }

    public Long getScheduledSessionId() { return scheduledSessionId; }
    public void setScheduledSessionId(Long scheduledSessionId) { this.scheduledSessionId = scheduledSessionId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getTotalMinutes() { return totalMinutes; }
    public void setTotalMinutes(int totalMinutes) { this.totalMinutes = totalMinutes; }

    public int getPausedMinutes() { return pausedMinutes; }
    public void setPausedMinutes(int pausedMinutes) { this.pausedMinutes = pausedMinutes; }

    public Short getFocusRating() { return focusRating; }
    public void setFocusRating(Short focusRating) { this.focusRating = focusRating; }

    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }

    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
