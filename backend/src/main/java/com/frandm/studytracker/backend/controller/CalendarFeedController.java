package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.UserSettings;
import com.frandm.studytracker.backend.security.CurrentUser;
import com.frandm.studytracker.backend.service.CalendarIcsService;
import com.frandm.studytracker.backend.service.UserSettingsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/calendar")
public class CalendarFeedController {

    private final CalendarIcsService calendarIcsService;
    private final UserSettingsService userSettingsService;

    public CalendarFeedController(
            CalendarIcsService calendarIcsService,
            UserSettingsService userSettingsService
    ) {
        this.calendarIcsService = calendarIcsService;
        this.userSettingsService = userSettingsService;
    }

    @GetMapping(value = "/feed/{token}.ics", produces = "text/calendar; charset=UTF-8")
    public ResponseEntity<String> getCalendarFeed(
            @PathVariable String token,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String layers
    ) {
        Optional<UUID> userIdOpt = userSettingsService.getUserIdByFeedToken(token);
        if (userIdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Calendar feed not found or invalid token\r\n");
        }

        Set<String> layerSet = null;
        if (layers != null && !layers.isBlank()) {
            layerSet = Arrays.stream(layers.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
        }

        String icsContent = calendarIcsService.generateCalendarIcs(userIdOpt.get(), subjectId, layerSet);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"studyzen.ics\"");
        headers.set(HttpHeaders.CACHE_CONTROL, "private, max-age=900");

        return new ResponseEntity<>(icsContent, headers, HttpStatus.OK);
    }

    @GetMapping("/feed-info")
    public ResponseEntity<Map<String, Object>> getFeedInfo(HttpServletRequest request) {
        UUID userId = CurrentUser.id();
        UserSettings settings = userSettingsService.getByUserId(userId);
        String token = settings.getCalendarFeedToken();

        return ResponseEntity.ok(buildFeedInfoMap(request, token));
    }

    @PostMapping("/feed-token/regenerate")
    public ResponseEntity<Map<String, Object>> regenerateFeedToken(HttpServletRequest request) {
        UUID userId = CurrentUser.id();
        String newToken = userSettingsService.regenerateCalendarFeedToken(userId);

        return ResponseEntity.ok(buildFeedInfoMap(request, newToken));
    }

    private Map<String, Object> buildFeedInfoMap(HttpServletRequest request, String token) {
        String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                .replacePath(null)
                .build()
                .toUriString();

        String httpsUrl = baseUrl + "/api/calendar/feed/" + token + ".ics";
        String webcalUrl = httpsUrl.replaceFirst("(?i)^https?://", "webcal://");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("httpsUrl", httpsUrl);
        response.put("webcalUrl", webcalUrl);
        return response;
    }
}
