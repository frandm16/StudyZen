package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.User;
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
        TokenService.TokenPair pair = authService.register(body.get("email"), body.get("password"), body.get("displayName"), request);
        return withCookies(pair, response);
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
    public ResponseEntity<User> getMe() { return ResponseEntity.ok(authService.getMe(CurrentUser.id())); }

    @PatchMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.updateProfile(CurrentUser.id(), body));
    }

    private ResponseEntity<Map<String, String>> withCookies(TokenService.TokenPair pair, HttpServletResponse response) {
        authCookies.setTokens(response, pair.accessToken(), pair.refreshToken());
        return ResponseEntity.ok(Map.of());
    }
}
