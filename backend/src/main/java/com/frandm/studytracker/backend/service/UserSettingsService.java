package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.UserSettings;
import com.frandm.studytracker.backend.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class UserSettingsService {

    private final UserSettingsRepository settingsRepository;

    public UserSettingsService(UserSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public UserSettings getByUserId(UUID userId) {
        return settingsRepository.findById(userId).orElseGet(() -> {
            UserSettings defaultSettings = new UserSettings();
            defaultSettings.setUserId(userId);
            defaultSettings.setUpdatedAt(OffsetDateTime.now());
            return settingsRepository.save(defaultSettings);
        });
    }

    public UserSettings update(UUID userId, UserSettings incoming) {
        UserSettings current = getByUserId(userId);

        if (incoming.getWeekStartsOn() >= 0 && incoming.getWeekStartsOn() <= 6) {
            current.setWeekStartsOn(incoming.getWeekStartsOn());
        }
        if (incoming.getDefaultSessionMinutes() > 0) {
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
        if (incoming.getPomodoroWorkMinutes() > 0) {
            current.setPomodoroWorkMinutes(incoming.getPomodoroWorkMinutes());
        }
        if (incoming.getPomodoroShortBreakMinutes() > 0) {
            current.setPomodoroShortBreakMinutes(incoming.getPomodoroShortBreakMinutes());
        }
        if (incoming.getPomodoroLongBreakMinutes() > 0) {
            current.setPomodoroLongBreakMinutes(incoming.getPomodoroLongBreakMinutes());
        }
        if (incoming.getPomodoroSessionsInterval() > 0) {
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
        if (incoming.getCountdownDefaultMinutes() > 0) {
            current.setCountdownDefaultMinutes(incoming.getCountdownDefaultMinutes());
        }
        if (incoming.getStopwatchTargetHours() > 0) {
            current.setStopwatchTargetHours(incoming.getStopwatchTargetHours());
        }
        if (incoming.getColorMode() != null) {
            current.setColorMode(incoming.getColorMode());
        }
        if (incoming.getColorTheme() != null) {
            current.setColorTheme(incoming.getColorTheme());
        }
        if (incoming.getMasterVolume() >= 0 && incoming.getMasterVolume() <= 100) {
            current.setMasterVolume(incoming.getMasterVolume());
        }
        if (incoming.getAlarmVolume() >= 0 && incoming.getAlarmVolume() <= 100) {
            current.setAlarmVolume(incoming.getAlarmVolume());
        }
        if (incoming.getNotificationVolume() >= 0 && incoming.getNotificationVolume() <= 100) {
            current.setNotificationVolume(incoming.getNotificationVolume());
        }
        if (incoming.getBackgroundVolume() >= 0 && incoming.getBackgroundVolume() <= 100) {
            current.setBackgroundVolume(incoming.getBackgroundVolume());
        }
        if (incoming.getAlarmPreset() != null) {
            current.setAlarmPreset(incoming.getAlarmPreset());
        }

        current.setUpdatedAt(OffsetDateTime.now());
        return settingsRepository.save(current);
    }
}
