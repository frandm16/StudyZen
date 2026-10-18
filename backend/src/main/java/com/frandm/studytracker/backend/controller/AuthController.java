package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.dto.auth.AuthenticatedUserResponse;
import com.frandm.studytracker.backend.security.AuthCookies;
import com.frandm.studytracker.backend.security.CurrentUser;
import com.frandm.studytracker.backend.security.JwtTokenProvider;
import com.frandm.studytracker.backend.service.AuthService;
import com.frandm.studytracker.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthCookies authCookies;
    private final TokenService tokenService;

    public AuthController(AuthService authService, AuthCookies authCookies, TokenService tokenService) {
        this.authService = authService;
        this.authCookies = authCookies;
        this.tokenService = tokenService;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken());
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> body,
            HttpServletRequest request, HttpServletResponse response) {
        authService.register(body.get("email"), body.get("password"), body.get("displayName"), request);
        return ResponseEntity.accepted().body(Map.of("message", "Check your email to verify your account"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody Map<String, String> body) {
        authService.verifyEmail(body.get("token"));
        return ResponseEntity.ok(Map.of("message", "Email verified"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> body) {
        authService.resendVerification(body.get("email"));
        return ResponseEntity.accepted().body(Map.of("message", "If the account requires verification, an email will be sent"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.accepted().body(Map.of("message", "If an account exists, password reset instructions will be sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password reset"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body,
            HttpServletRequest request, HttpServletResponse response) {
        TokenService.TokenPair pair = authService.login(body.get("email"), body.get("password"), request);
        return withCookies(pair, response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request, HttpServletResponse response) {
        TokenService.TokenPair pair = authService.refresh(authCookies.refreshToken(request), request);
        return withCookies(pair, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(authCookies.refreshToken(request), CurrentUser.optionalId());
        authCookies.clear(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserResponse> getMe() {
        var userId = CurrentUser.id();
        return ResponseEntity.ok(AuthenticatedUserResponse.from(
                authService.getMe(userId), authService.hasGoogleIdentity(userId)));

    }

    @PatchMapping("/profile")
    public ResponseEntity<AuthenticatedUserResponse> updateProfile(@RequestBody Map<String, String> body) {
        var userId = CurrentUser.id();
        return ResponseEntity.ok(AuthenticatedUserResponse.from(
                authService.updateProfile(userId, body), authService.hasGoogleIdentity(userId)));
    }

    private ResponseEntity<Map<String, String>> withCookies(TokenService.TokenPair pair, HttpServletResponse response) {
        authCookies.setTokens(response, pair.accessToken(), pair.refreshToken());
        return ResponseEntity.ok(Map.of());
    }
}
