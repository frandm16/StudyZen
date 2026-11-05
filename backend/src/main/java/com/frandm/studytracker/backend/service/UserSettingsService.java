package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.UserSettings;
import com.frandm.studytracker.backend.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserSettingsService {

    private final UserSettingsRepository settingsRepository;

    public UserSettingsService(UserSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    private String generateCalendarFeedToken() {
        return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
    }

    public UserSettings getByUserId(UUID userId) {
        UserSettings settings = settingsRepository.findById(userId).orElseGet(() -> {
            UserSettings defaults = new UserSettings();
            defaults.setUserId(userId);
            defaults.setWeekStartsOn((short) 1);
            defaults.setDefaultSessionMinutes(50);
            defaults.setTheme("system");
            defaults.setGradeScaleMax(java.math.BigDecimal.valueOf(10.0));
            defaults.setPassGrade(java.math.BigDecimal.valueOf(5.0));
            defaults.setPomodoroWorkMinutes(25);
            defaults.setPomodoroShortBreakMinutes(5);
            defaults.setPomodoroLongBreakMinutes(15);
            defaults.setPomodoroSessionsInterval(4);
            defaults.setAutoStartBreaks(false);
            defaults.setAutoStartWork(false);
            defaults.setCountBreakTime(false);
            defaults.setCountdownDefaultMinutes(10);
            defaults.setStopwatchTargetHours(2);
            defaults.setColorMode("dark");
            defaults.setColorTheme("default");
            defaults.setMasterVolume(100);
            defaults.setAlarmVolume(100);
            defaults.setNotificationVolume(100);
            defaults.setBackgroundVolume(35);
            defaults.setAlarmPreset("bells");
            defaults.setCalendarFeedToken(generateCalendarFeedToken());
            defaults.setUpdatedAt(OffsetDateTime.now());
            return settingsRepository.save(defaults);
        });

        if (settings.getCalendarFeedToken() == null || settings.getCalendarFeedToken().isBlank()) {
            settings.setCalendarFeedToken(generateCalendarFeedToken());
            settings = settingsRepository.save(settings);
        }

        return settings;
    }

    public String regenerateCalendarFeedToken(UUID userId) {
        UserSettings current = getByUserId(userId);
        String newToken = generateCalendarFeedToken();
        current.setCalendarFeedToken(newToken);
        current.setUpdatedAt(OffsetDateTime.now());
        settingsRepository.save(current);
        return newToken;
    }

    public Optional<UUID> getUserIdByFeedToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return settingsRepository.findByCalendarFeedToken(token).map(UserSettings::getUserId);
    }

    public UserSettings update(UUID userId, UserSettings incoming) {
        UserSettings current = getByUserId(userId);

        if (incoming.getWeekStartsOn() != null && incoming.getWeekStartsOn() >= 0 && incoming.getWeekStartsOn() <= 6) {
            current.setWeekStartsOn(incoming.getWeekStartsOn());
        }
        if (incoming.getDefaultSessionMinutes() != null && incoming.getDefaultSessionMinutes() > 0) {
            current.setDefaultSessionMinutes(incoming.getDefaultSessionMinutes());
        }
        if (incoming.getTheme() != null) {
            current.setTheme(incoming.getTheme());
        }
        if (incoming.getGradeScaleMax() != null) {
            current.setGradeScaleMax(incoming.getGradeScaleMax());
        }
        if (incoming.getPassGrade() != null) {
            current.setPassGrade(incoming.getPassGrade());
        }
        if (incoming.getPomodoroWorkMinutes() != null && incoming.getPomodoroWorkMinutes() > 0) {
            current.setPomodoroWorkMinutes(incoming.getPomodoroWorkMinutes());
        }
        if (incoming.getPomodoroShortBreakMinutes() != null && incoming.getPomodoroShortBreakMinutes() > 0) {
            current.setPomodoroShortBreakMinutes(incoming.getPomodoroShortBreakMinutes());
        }
        if (incoming.getPomodoroLongBreakMinutes() != null && incoming.getPomodoroLongBreakMinutes() > 0) {
            current.setPomodoroLongBreakMinutes(incoming.getPomodoroLongBreakMinutes());
        }
        if (incoming.getPomodoroSessionsInterval() != null && incoming.getPomodoroSessionsInterval() > 0) {
            current.setPomodoroSessionsInterval(incoming.getPomodoroSessionsInterval());
        }
        if (incoming.getAutoStartBreaks() != null) {
            current.setAutoStartBreaks(incoming.getAutoStartBreaks());
        }
        if (incoming.getAutoStartWork() != null) {
            current.setAutoStartWork(incoming.getAutoStartWork());
        }
        if (incoming.getCountBreakTime() != null) {
            current.setCountBreakTime(incoming.getCountBreakTime());
        }
        if (incoming.getCountdownDefaultMinutes() != null && incoming.getCountdownDefaultMinutes() > 0) {
            current.setCountdownDefaultMinutes(incoming.getCountdownDefaultMinutes());
        }
        if (incoming.getStopwatchTargetHours() != null && incoming.getStopwatchTargetHours() > 0) {
            current.setStopwatchTargetHours(incoming.getStopwatchTargetHours());
        }
        if (incoming.getColorMode() != null) {
            current.setColorMode(incoming.getColorMode());
        }
        if (incoming.getColorTheme() != null) {
            current.setColorTheme(incoming.getColorTheme());
        }
        if (incoming.getMasterVolume() != null && incoming.getMasterVolume() >= 0 && incoming.getMasterVolume() <= 100) {
            current.setMasterVolume(incoming.getMasterVolume());
        }
        if (incoming.getAlarmVolume() != null && incoming.getAlarmVolume() >= 0 && incoming.getAlarmVolume() <= 100) {
            current.setAlarmVolume(incoming.getAlarmVolume());
        }
        if (incoming.getNotificationVolume() != null && incoming.getNotificationVolume() >= 0 && incoming.getNotificationVolume() <= 100) {
            current.setNotificationVolume(incoming.getNotificationVolume());
        }
        if (incoming.getBackgroundVolume() != null && incoming.getBackgroundVolume() >= 0 && incoming.getBackgroundVolume() <= 100) {
            current.setBackgroundVolume(incoming.getBackgroundVolume());
        }
        if (incoming.getAlarmPreset() != null) {
            current.setAlarmPreset(incoming.getAlarmPreset());
        }

        current.setUpdatedAt(OffsetDateTime.now());
        return settingsRepository.save(current);
    }
}
