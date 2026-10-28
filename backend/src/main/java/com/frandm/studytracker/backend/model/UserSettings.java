package com.frandm.studytracker.backend.model;

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

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
