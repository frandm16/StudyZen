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
    private short weekStartsOn = 1;

    @Column(name = "default_session_minutes", nullable = false)
    private int defaultSessionMinutes = 50;

    @Column(nullable = false)
    private String theme = "system";

    @Column(name = "grade_scale_max", precision = 5, scale = 2)
    private BigDecimal gradeScaleMax = BigDecimal.valueOf(10.0);

    @Column(name = "pass_grade", precision = 5, scale = 2)
    private BigDecimal passGrade = BigDecimal.valueOf(5.0);

    @Column(name = "pomodoro_work_minutes", nullable = false)
    private int pomodoroWorkMinutes = 25;

    @Column(name = "pomodoro_short_break_minutes", nullable = false)
    private int pomodoroShortBreakMinutes = 5;

    @Column(name = "pomodoro_long_break_minutes", nullable = false)
    private int pomodoroLongBreakMinutes = 15;

    @Column(name = "pomodoro_sessions_interval", nullable = false)
    private int pomodoroSessionsInterval = 4;

    @Column(name = "auto_start_breaks", nullable = false)
    private Boolean autoStartBreaks = false;

    @Column(name = "auto_start_work", nullable = false)
    private Boolean autoStartWork = false;

    @Column(name = "count_break_time", nullable = false)
    private Boolean countBreakTime = false;

    @Column(name = "countdown_default_minutes", nullable = false)
    private int countdownDefaultMinutes = 10;

    @Column(name = "stopwatch_target_hours", nullable = false)
    private int stopwatchTargetHours = 2;

    @Column(name = "color_mode", nullable = false)
    private String colorMode = "dark";

    @Column(name = "color_theme", nullable = false)
    private String colorTheme = "default";

    @Column(name = "master_volume", nullable = false)
    private int masterVolume = 100;

    @Column(name = "alarm_volume", nullable = false)
    private int alarmVolume = 100;

    @Column(name = "notification_volume", nullable = false)
    private int notificationVolume = 100;

    @Column(name = "background_volume", nullable = false)
    private int backgroundVolume = 35;

    @Column(name = "alarm_preset", nullable = false)
    private String alarmPreset = "bells";

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public short getWeekStartsOn() { return weekStartsOn; }
    public void setWeekStartsOn(short weekStartsOn) { this.weekStartsOn = weekStartsOn; }

    public int getDefaultSessionMinutes() { return defaultSessionMinutes; }
    public void setDefaultSessionMinutes(int defaultSessionMinutes) { this.defaultSessionMinutes = defaultSessionMinutes; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public BigDecimal getGradeScaleMax() { return gradeScaleMax; }
    public void setGradeScaleMax(BigDecimal gradeScaleMax) { this.gradeScaleMax = gradeScaleMax; }

    public BigDecimal getPassGrade() { return passGrade; }
    public void setPassGrade(BigDecimal passGrade) { this.passGrade = passGrade; }

    public int getPomodoroWorkMinutes() { return pomodoroWorkMinutes; }
    public void setPomodoroWorkMinutes(int pomodoroWorkMinutes) { this.pomodoroWorkMinutes = pomodoroWorkMinutes; }

    public int getPomodoroShortBreakMinutes() { return pomodoroShortBreakMinutes; }
    public void setPomodoroShortBreakMinutes(int pomodoroShortBreakMinutes) { this.pomodoroShortBreakMinutes = pomodoroShortBreakMinutes; }

    public int getPomodoroLongBreakMinutes() { return pomodoroLongBreakMinutes; }
    public void setPomodoroLongBreakMinutes(int pomodoroLongBreakMinutes) { this.pomodoroLongBreakMinutes = pomodoroLongBreakMinutes; }

    public int getPomodoroSessionsInterval() { return pomodoroSessionsInterval; }
    public void setPomodoroSessionsInterval(int pomodoroSessionsInterval) { this.pomodoroSessionsInterval = pomodoroSessionsInterval; }

    public Boolean getAutoStartBreaks() { return autoStartBreaks; }
    public Boolean isAutoStartBreaks() { return autoStartBreaks; }
    public void setAutoStartBreaks(Boolean autoStartBreaks) { this.autoStartBreaks = autoStartBreaks; }

    public Boolean getAutoStartWork() { return autoStartWork; }
    public Boolean isAutoStartWork() { return autoStartWork; }
    public void setAutoStartWork(Boolean autoStartWork) { this.autoStartWork = autoStartWork; }

    public Boolean getCountBreakTime() { return countBreakTime; }
    public Boolean isCountBreakTime() { return countBreakTime; }
    public void setCountBreakTime(Boolean countBreakTime) { this.countBreakTime = countBreakTime; }

    public int getCountdownDefaultMinutes() { return countdownDefaultMinutes; }
    public void setCountdownDefaultMinutes(int countdownDefaultMinutes) { this.countdownDefaultMinutes = countdownDefaultMinutes; }

    public int getStopwatchTargetHours() { return stopwatchTargetHours; }
    public void setStopwatchTargetHours(int stopwatchTargetHours) { this.stopwatchTargetHours = stopwatchTargetHours; }

    public String getColorMode() { return colorMode; }
    public void setColorMode(String colorMode) { this.colorMode = colorMode; }

    public String getColorTheme() { return colorTheme; }
    public void setColorTheme(String colorTheme) { this.colorTheme = colorTheme; }

    public int getMasterVolume() { return masterVolume; }
    public void setMasterVolume(int masterVolume) { this.masterVolume = masterVolume; }

    public int getAlarmVolume() { return alarmVolume; }
    public void setAlarmVolume(int alarmVolume) { this.alarmVolume = alarmVolume; }

    public int getNotificationVolume() { return notificationVolume; }
    public void setNotificationVolume(int notificationVolume) { this.notificationVolume = notificationVolume; }

    public int getBackgroundVolume() { return backgroundVolume; }
    public void setBackgroundVolume(int backgroundVolume) { this.backgroundVolume = backgroundVolume; }

    public String getAlarmPreset() { return alarmPreset; }
    public void setAlarmPreset(String alarmPreset) { this.alarmPreset = alarmPreset; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
