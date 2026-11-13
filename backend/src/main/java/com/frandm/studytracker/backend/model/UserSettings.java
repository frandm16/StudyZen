package com.frandm.studytracker.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
public class UserSettings {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "week_starts_on", nullable = false)
    private Short weekStartsOn;

    @Column(name = "default_session_minutes", nullable = false)
    private Integer defaultSessionMinutes;

    @Column(nullable = false)
    private String theme;

    @Column(name = "grade_scale_max", precision = 5, scale = 2)
    private BigDecimal gradeScaleMax;

    @Column(name = "pass_grade", precision = 5, scale = 2)
    private BigDecimal passGrade;

    @Column(name = "pomodoro_work_minutes", nullable = false)
    private Integer pomodoroWorkMinutes;

    @Column(name = "pomodoro_short_break_minutes", nullable = false)
    private Integer pomodoroShortBreakMinutes;

    @Column(name = "pomodoro_long_break_minutes", nullable = false)
    private Integer pomodoroLongBreakMinutes;

    @Column(name = "pomodoro_sessions_interval", nullable = false)
    private Integer pomodoroSessionsInterval;

    @Column(name = "auto_start_breaks", nullable = false)
    private Boolean autoStartBreaks;

    @Column(name = "auto_start_work", nullable = false)
    private Boolean autoStartWork;

    @Column(name = "count_break_time", nullable = false)
    private Boolean countBreakTime;

    @Column(name = "countdown_default_minutes", nullable = false)
    private Integer countdownDefaultMinutes;

    @Column(name = "stopwatch_target_hours", nullable = false)
    private Integer stopwatchTargetHours;

    @Column(name = "color_mode", nullable = false)
    private String colorMode;

    @Column(name = "color_theme", nullable = false)
    private String colorTheme;

    @Column(name = "master_volume", nullable = false)
    private Integer masterVolume;

    @Column(name = "alarm_volume", nullable = false)
    private Integer alarmVolume;

    @Column(name = "notification_volume", nullable = false)
    private Integer notificationVolume;

    @Column(name = "background_volume", nullable = false)
    private Integer backgroundVolume;

    @Column(name = "alarm_preset", nullable = false)
    private String alarmPreset;

    @Column(name = "calendar_feed_token", unique = true, length = 64)
    private String calendarFeedToken;

    @Column(name = "notify_exam_7d", nullable = false)
    private Boolean notifyExam7d;

    @Column(name = "notify_exam_3d", nullable = false)
    private Boolean notifyExam3d;

    @Column(name = "notify_exam_24h", nullable = false)
    private Boolean notifyExam24h;

    @Column(name = "notify_deadline_7d", nullable = false)
    private Boolean notifyDeadline7d;

    @Column(name = "notify_deadline_3d", nullable = false)
    private Boolean notifyDeadline3d;

    @Column(name = "notify_deadline_24h", nullable = false)
    private Boolean notifyDeadline24h;

    @Column(name = "notify_deadline_completed", nullable = false)
    private Boolean notifyDeadlineCompleted;

    @Column(name = "notify_session_logged", nullable = false)
    private Boolean notifySessionLogged;

    @Column(name = "notify_topic_mastered", nullable = false)
    private Boolean notifyTopicMastered;

    @Column(name = "notify_goal_reached", nullable = false)
    private Boolean notifyGoalReached;

    @Column(name = "notify_goal_80pct", nullable = false)
    private Boolean notifyGoal80pct;

    @Column(name = "notification_center_enabled", nullable = false)
    private Boolean notificationCenterEnabled;

    @Column(name = "notification_center_url", length = 500)
    private String notificationCenterUrl;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "notification_center_token", length = 1000)
    private String notificationCenterToken;

    @Column(name = "notify_center_exam_7d", nullable = false)
    private Boolean notifyCenterExam7d;
    @Column(name = "notify_center_exam_3d", nullable = false)
    private Boolean notifyCenterExam3d;
    @Column(name = "notify_center_exam_24h", nullable = false)
    private Boolean notifyCenterExam24h;
    @Column(name = "notify_center_deadline_7d", nullable = false)
    private Boolean notifyCenterDeadline7d;
    @Column(name = "notify_center_deadline_3d", nullable = false)
    private Boolean notifyCenterDeadline3d;
    @Column(name = "notify_center_deadline_24h", nullable = false)
    private Boolean notifyCenterDeadline24h;
    @Column(name = "notify_center_deadline_completed", nullable = false)
    private Boolean notifyCenterDeadlineCompleted;
    @Column(name = "notify_center_session_logged", nullable = false)
    private Boolean notifyCenterSessionLogged;
    @Column(name = "notify_center_topic_mastered", nullable = false)
    private Boolean notifyCenterTopicMastered;
    @Column(name = "notify_center_goal_reached", nullable = false)
    private Boolean notifyCenterGoalReached;
    @Column(name = "notify_center_goal_80pct", nullable = false)
    private Boolean notifyCenterGoal80pct;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public Short getWeekStartsOn() { return weekStartsOn; }
    public void setWeekStartsOn(Short weekStartsOn) { this.weekStartsOn = weekStartsOn; }

    public Integer getDefaultSessionMinutes() { return defaultSessionMinutes; }
    public void setDefaultSessionMinutes(Integer defaultSessionMinutes) { this.defaultSessionMinutes = defaultSessionMinutes; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public BigDecimal getGradeScaleMax() { return gradeScaleMax; }
    public void setGradeScaleMax(BigDecimal gradeScaleMax) { this.gradeScaleMax = gradeScaleMax; }

    public BigDecimal getPassGrade() { return passGrade; }
    public void setPassGrade(BigDecimal passGrade) { this.passGrade = passGrade; }

    public Integer getPomodoroWorkMinutes() { return pomodoroWorkMinutes; }
    public void setPomodoroWorkMinutes(Integer pomodoroWorkMinutes) { this.pomodoroWorkMinutes = pomodoroWorkMinutes; }

    public Integer getPomodoroShortBreakMinutes() { return pomodoroShortBreakMinutes; }
    public void setPomodoroShortBreakMinutes(Integer pomodoroShortBreakMinutes) { this.pomodoroShortBreakMinutes = pomodoroShortBreakMinutes; }

    public Integer getPomodoroLongBreakMinutes() { return pomodoroLongBreakMinutes; }
    public void setPomodoroLongBreakMinutes(Integer pomodoroLongBreakMinutes) { this.pomodoroLongBreakMinutes = pomodoroLongBreakMinutes; }

    public Integer getPomodoroSessionsInterval() { return pomodoroSessionsInterval; }
    public void setPomodoroSessionsInterval(Integer pomodoroSessionsInterval) { this.pomodoroSessionsInterval = pomodoroSessionsInterval; }

    public Boolean getAutoStartBreaks() { return autoStartBreaks; }
    public Boolean isAutoStartBreaks() { return autoStartBreaks; }
    public void setAutoStartBreaks(Boolean autoStartBreaks) { this.autoStartBreaks = autoStartBreaks; }

    public Boolean getAutoStartWork() { return autoStartWork; }
    public Boolean isAutoStartWork() { return autoStartWork; }
    public void setAutoStartWork(Boolean autoStartWork) { this.autoStartWork = autoStartWork; }

    public Boolean getCountBreakTime() { return countBreakTime; }
    public Boolean isCountBreakTime() { return countBreakTime; }
    public void setCountBreakTime(Boolean countBreakTime) { this.countBreakTime = countBreakTime; }

    public Integer getCountdownDefaultMinutes() { return countdownDefaultMinutes; }
    public void setCountdownDefaultMinutes(Integer countdownDefaultMinutes) { this.countdownDefaultMinutes = countdownDefaultMinutes; }

    public Integer getStopwatchTargetHours() { return stopwatchTargetHours; }
    public void setStopwatchTargetHours(Integer stopwatchTargetHours) { this.stopwatchTargetHours = stopwatchTargetHours; }

    public String getColorMode() { return colorMode; }
    public void setColorMode(String colorMode) { this.colorMode = colorMode; }

    public String getColorTheme() { return colorTheme; }
    public void setColorTheme(String colorTheme) { this.colorTheme = colorTheme; }

    public Integer getMasterVolume() { return masterVolume; }
    public void setMasterVolume(Integer masterVolume) { this.masterVolume = masterVolume; }

    public Integer getAlarmVolume() { return alarmVolume; }
    public void setAlarmVolume(Integer alarmVolume) { this.alarmVolume = alarmVolume; }

    public Integer getNotificationVolume() { return notificationVolume; }
    public void setNotificationVolume(Integer notificationVolume) { this.notificationVolume = notificationVolume; }

    public Integer getBackgroundVolume() { return backgroundVolume; }
    public void setBackgroundVolume(Integer backgroundVolume) { this.backgroundVolume = backgroundVolume; }

    public String getAlarmPreset() { return alarmPreset; }
    public void setAlarmPreset(String alarmPreset) { this.alarmPreset = alarmPreset; }

    public String getCalendarFeedToken() { return calendarFeedToken; }
    public void setCalendarFeedToken(String calendarFeedToken) { this.calendarFeedToken = calendarFeedToken; }

    public Boolean getNotifyExam7d() { return notifyExam7d; }
    public void setNotifyExam7d(Boolean notifyExam7d) { this.notifyExam7d = notifyExam7d; }

    public Boolean getNotifyExam3d() { return notifyExam3d; }
    public void setNotifyExam3d(Boolean notifyExam3d) { this.notifyExam3d = notifyExam3d; }

    public Boolean getNotifyExam24h() { return notifyExam24h; }
    public void setNotifyExam24h(Boolean notifyExam24h) { this.notifyExam24h = notifyExam24h; }

    public Boolean getNotifyDeadline7d() { return notifyDeadline7d; }
    public void setNotifyDeadline7d(Boolean notifyDeadline7d) { this.notifyDeadline7d = notifyDeadline7d; }

    public Boolean getNotifyDeadline3d() { return notifyDeadline3d; }
    public void setNotifyDeadline3d(Boolean notifyDeadline3d) { this.notifyDeadline3d = notifyDeadline3d; }

    public Boolean getNotifyDeadline24h() { return notifyDeadline24h; }
    public void setNotifyDeadline24h(Boolean notifyDeadline24h) { this.notifyDeadline24h = notifyDeadline24h; }

    public Boolean getNotifyDeadlineCompleted() { return notifyDeadlineCompleted; }
    public void setNotifyDeadlineCompleted(Boolean notifyDeadlineCompleted) { this.notifyDeadlineCompleted = notifyDeadlineCompleted; }

    public Boolean getNotifySessionLogged() { return notifySessionLogged; }
    public void setNotifySessionLogged(Boolean notifySessionLogged) { this.notifySessionLogged = notifySessionLogged; }

    public Boolean getNotifyTopicMastered() { return notifyTopicMastered; }
    public void setNotifyTopicMastered(Boolean notifyTopicMastered) { this.notifyTopicMastered = notifyTopicMastered; }

    public Boolean getNotifyGoalReached() { return notifyGoalReached; }
    public void setNotifyGoalReached(Boolean notifyGoalReached) { this.notifyGoalReached = notifyGoalReached; }

    public Boolean getNotifyGoal80pct() { return notifyGoal80pct; }
    public void setNotifyGoal80pct(Boolean notifyGoal80pct) { this.notifyGoal80pct = notifyGoal80pct; }

    public Boolean getNotificationCenterEnabled() { return notificationCenterEnabled; }
    public void setNotificationCenterEnabled(Boolean notificationCenterEnabled) { this.notificationCenterEnabled = notificationCenterEnabled; }

    public String getNotificationCenterUrl() { return notificationCenterUrl; }
    public void setNotificationCenterUrl(String notificationCenterUrl) { this.notificationCenterUrl = notificationCenterUrl; }

    public String getNotificationCenterToken() { return notificationCenterToken; }
    public void setNotificationCenterToken(String notificationCenterToken) { this.notificationCenterToken = notificationCenterToken; }

    public Boolean getNotifyCenterExam7d() { return notifyCenterExam7d; }
    public void setNotifyCenterExam7d(Boolean value) { notifyCenterExam7d = value; }
    public Boolean getNotifyCenterExam3d() { return notifyCenterExam3d; }
    public void setNotifyCenterExam3d(Boolean value) { notifyCenterExam3d = value; }
    public Boolean getNotifyCenterExam24h() { return notifyCenterExam24h; }
    public void setNotifyCenterExam24h(Boolean value) { notifyCenterExam24h = value; }
    public Boolean getNotifyCenterDeadline7d() { return notifyCenterDeadline7d; }
    public void setNotifyCenterDeadline7d(Boolean value) { notifyCenterDeadline7d = value; }
    public Boolean getNotifyCenterDeadline3d() { return notifyCenterDeadline3d; }
    public void setNotifyCenterDeadline3d(Boolean value) { notifyCenterDeadline3d = value; }
    public Boolean getNotifyCenterDeadline24h() { return notifyCenterDeadline24h; }
    public void setNotifyCenterDeadline24h(Boolean value) { notifyCenterDeadline24h = value; }
    public Boolean getNotifyCenterDeadlineCompleted() { return notifyCenterDeadlineCompleted; }
    public void setNotifyCenterDeadlineCompleted(Boolean value) { notifyCenterDeadlineCompleted = value; }
    public Boolean getNotifyCenterSessionLogged() { return notifyCenterSessionLogged; }
    public void setNotifyCenterSessionLogged(Boolean value) { notifyCenterSessionLogged = value; }
    public Boolean getNotifyCenterTopicMastered() { return notifyCenterTopicMastered; }
    public void setNotifyCenterTopicMastered(Boolean value) { notifyCenterTopicMastered = value; }
    public Boolean getNotifyCenterGoalReached() { return notifyCenterGoalReached; }
    public void setNotifyCenterGoalReached(Boolean value) { notifyCenterGoalReached = value; }
    public Boolean getNotifyCenterGoal80pct() { return notifyCenterGoal80pct; }
    public void setNotifyCenterGoal80pct(Boolean value) { notifyCenterGoal80pct = value; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
