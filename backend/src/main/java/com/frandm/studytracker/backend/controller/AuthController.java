package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.service.AuthService;
import com.frandm.studytracker.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    public AuthController(AuthService authService, TokenService tokenService) {
        this.authService = authService;
        this.tokenService = tokenService;
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
    public ResponseEntity<Void> logout(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok().build();
    }
}
