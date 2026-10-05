package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.repository.UserRepository;
import com.frandm.studytracker.backend.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       JwtTokenProvider jwtTokenProvider,
                       TokenService tokenService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, String> register(String email, String password,
                                         String displayName, HttpServletRequest request) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setDisplayName(displayName != null ? displayName.trim() : null);
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), email);
        String refreshToken = tokenService.createRefreshToken(user.getId(), request);
        return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
    }

    public Map<String, String> login(String email, String password,
                                      HttpServletRequest request) {
        if (email == null || password == null) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (user.getPasswordHash() == null ||
                !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = tokenService.createRefreshToken(user.getId(), request);
        return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
    }

    public Map<String, String> refresh(String rawRefreshToken, HttpServletRequest request) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }
        TokenService.TokenPair pair = tokenService.rotateRefreshToken(rawRefreshToken,
                userRepository, request);
        return Map.of("accessToken", pair.accessToken(), "refreshToken", pair.refreshToken());
    }

    public void logout(String refreshToken, UUID userId) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            tokenService.revokeToken(refreshToken);
        }
    }

    public User getMe(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User updateProfile(UUID userId, Map<String, String> body) {
        User user = getMe(userId);

        if (body.containsKey("displayName")) {
            String displayName = body.get("displayName");
            user.setDisplayName(displayName != null ? displayName.trim() : null);
        }

        if (body.containsKey("email")) {
            String newEmail = body.get("email") != null ? body.get("email").trim().toLowerCase() : null;
            if (newEmail != null && !newEmail.isBlank() && !newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new IllegalArgumentException("Email already in use");
                }
                user.setEmail(newEmail);
            }
        }

        if (body.containsKey("newPassword") && body.get("newPassword") != null && !body.get("newPassword").isBlank()) {
            String newPassword = body.get("newPassword");
            String currentPassword = body.get("currentPassword");

            if (user.getPasswordHash() != null) {
                if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                    throw new IllegalArgumentException("Current password is incorrect");
                }
            }
            if (newPassword.length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters");
            }
            user.setPasswordHash(passwordEncoder.encode(newPassword));
        }

        if (body.containsKey("avatarUrl")) {
            user.setAvatarUrl(body.get("avatarUrl"));
        }
        if (body.containsKey("timezone")) {
            user.setTimezone(body.get("timezone"));
        }
        if (body.containsKey("locale")) {
            user.setLocale(body.get("locale"));
        }

        user.setUpdatedAt(OffsetDateTime.now());
        return userRepository.save(user);
    }
}
