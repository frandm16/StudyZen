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
    private BigDecimal gradeScaleMax;

    @Column(name = "pass_grade", precision = 5, scale = 2)
    private BigDecimal passGrade;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

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

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
