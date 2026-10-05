package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.security.CurrentUser;
import com.frandm.studytracker.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        return ResponseEntity.ok(authService.register(
                body.get("email"),
                body.get("password"),
                body.get("displayName"),
                request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        return ResponseEntity.ok(authService.login(
                body.get("email"),
                body.get("password"),
                request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        return ResponseEntity.ok(authService.refresh(body.get("refreshToken"), request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) Map<String, String> body) {
        String refreshToken = body != null ? body.get("refreshToken") : null;
        try {
            authService.logout(refreshToken, CurrentUser.id());
        } catch (Exception ignored) {
            // Ignored if user context not present during logout
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe() {
        return ResponseEntity.ok(authService.getMe(CurrentUser.id()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.updateProfile(CurrentUser.id(), body));
    }
}
