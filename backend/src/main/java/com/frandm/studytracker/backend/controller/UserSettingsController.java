package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.UserSettings;
import com.frandm.studytracker.backend.security.CurrentUser;
import com.frandm.studytracker.backend.service.UserSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;

    public UserSettingsController(UserSettingsService userSettingsService) {
        this.userSettingsService = userSettingsService;
    }

    @GetMapping
    public ResponseEntity<UserSettings> getSettings() {
        return ResponseEntity.ok(userSettingsService.getByUserId(CurrentUser.id()));
    }

    @PutMapping
    public ResponseEntity<UserSettings> updateSettings(@RequestBody UserSettings settings) {
        return ResponseEntity.ok(userSettingsService.update(CurrentUser.id(), settings));
    }

    @PatchMapping
    public ResponseEntity<UserSettings> patchSettings(@RequestBody UserSettings settings) {
        return ResponseEntity.ok(userSettingsService.update(CurrentUser.id(), settings));
    }
}
