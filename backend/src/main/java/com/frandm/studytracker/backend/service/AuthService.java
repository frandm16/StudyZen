package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.config.ClientRequestException;
import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.repository.AuthIdentityRepository;
import com.frandm.studytracker.backend.repository.UserRepository;
import com.frandm.studytracker.backend.model.enums.AuthProvider;
import com.frandm.studytracker.backend.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuthIdentityRepository authIdentityRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    public AuthService(UserRepository userRepository,
                       AuthIdentityRepository authIdentityRepository,
                       JwtTokenProvider jwtTokenProvider,
                       TokenService tokenService,
                       PasswordEncoder passwordEncoder,
                       EmailVerificationService emailVerificationService) {
        this.userRepository = userRepository;
        this.authIdentityRepository = authIdentityRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.emailVerificationService = emailVerificationService;
    }

    @org.springframework.transaction.annotation.Transactional
    public void register(String email, String password,
                                         String displayName, HttpServletRequest request) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new ClientRequestException("Email and password are required");
        }
        String normalizedEmail = normalizeAndValidateEmail(email);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ClientRequestException("Email already registered", org.springframework.http.HttpStatus.CONFLICT);
        }
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setDisplayName(displayName != null ? displayName.trim() : null);
        try {
            userRepository.saveAndFlush(user);
            emailVerificationService.sendToken(user, com.frandm.studytracker.backend.model.enums.TokenPurpose.email_verification);
        } catch (DataIntegrityViolationException exception) {
            throw new ClientRequestException("Email already registered", org.springframework.http.HttpStatus.CONFLICT);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public TokenService.TokenPair login(String email, String password,
                                      HttpServletRequest request) {
        if (email == null || password == null) {
            throw new ClientRequestException("Invalid credentials");
        }
        String normalizedEmail = normalizeAndValidateEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ClientRequestException("Invalid credentials"));

        if (user.getPasswordHash() == null ||
                !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ClientRequestException("Invalid credentials");
        }

        if (user.getEmailVerifiedAt() == null) throw new ClientRequestException("Email address is not verified", org.springframework.http.HttpStatus.FORBIDDEN);
        if (!user.isActive()) throw new ClientRequestException("Account is inactive");
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = tokenService.createRefreshToken(user.getId(), request);
        return new TokenService.TokenPair(accessToken, refreshToken);
    }

    @org.springframework.transaction.annotation.Transactional
    public TokenService.TokenPair refresh(String rawRefreshToken, HttpServletRequest request) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new ClientRequestException("Refresh token is required");
        }
        TokenService.TokenPair pair = tokenService.rotateRefreshToken(rawRefreshToken,
                userRepository, request);
        return pair;
    }

    public void logout(String refreshToken, UUID userId) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            tokenService.revokeToken(refreshToken);
        }
    }

    private String normalizeAndValidateEmail(String email) {
        String normalized = email.trim().toLowerCase(java.util.Locale.ROOT);
        if (normalized.length() > 254 || !org.springframework.util.StringUtils.hasText(normalized)
                || !normalized.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ClientRequestException("A valid email address is required");
        }
        return normalized;
    }

    @org.springframework.transaction.annotation.Transactional
    public void resendVerification(String email) {
        String normalizedEmail = normalizeAndValidateEmail(email == null ? "" : email);
        userRepository.findByEmail(normalizedEmail)
                .filter(user -> user.getEmailVerifiedAt() == null)
                .ifPresent(user -> emailVerificationService.sendToken(user,
                        com.frandm.studytracker.backend.model.enums.TokenPurpose.email_verification));
    }

    @org.springframework.transaction.annotation.Transactional
    public void forgotPassword(String email) {
        String normalizedEmail = normalizeAndValidateEmail(email == null ? "" : email);
        userRepository.findByEmail(normalizedEmail)
                .filter(user -> user.getPasswordHash() != null)
                .ifPresent(user -> emailVerificationService.sendToken(user,
                        com.frandm.studytracker.backend.model.enums.TokenPurpose.password_reset));
    }

    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(String rawToken, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new ClientRequestException("Password must be at least 6 characters");
        }
        User user = emailVerificationService.consume(rawToken,
                com.frandm.studytracker.backend.model.enums.TokenPurpose.password_reset);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenService.revokeAllUserTokens(user.getId());
    }

    public void verifyEmail(String rawToken) {
        emailVerificationService.verify(rawToken);
    }

    public User getMe(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ClientRequestException("Resource not found", org.springframework.http.HttpStatus.NOT_FOUND));
    }

    public boolean hasGoogleIdentity(UUID userId) {
        return authIdentityRepository.existsByUserIdAndProvider(userId, AuthProvider.google);
    }

    public User updateProfile(UUID userId, Map<String, String> body) {
        User user = getMe(userId);

        if (body.containsKey("displayName")) {
            String displayName = body.get("displayName");
            user.setDisplayName(displayName != null ? displayName.trim() : null);
        }

        if (body.containsKey("email") && body.get("email") != null && !body.get("email").trim().equalsIgnoreCase(user.getEmail())) {
            throw new ClientRequestException("Email changes require the email verification flow");
        }

        if (body.containsKey("newPassword") && body.get("newPassword") != null && !body.get("newPassword").isBlank()) {
            String newPassword = body.get("newPassword");
            String currentPassword = body.get("currentPassword");

            if (user.getPasswordHash() != null) {
                if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                    throw new ClientRequestException("Current password is incorrect");
                }
            }
            if (newPassword.length() < 6) {
                throw new ClientRequestException("Password must be at least 6 characters");
            }
            user.setPasswordHash(passwordEncoder.encode(newPassword));
        }

        if (body.containsKey("username")) {
            String newUsername = body.get("username") != null ? body.get("username").trim() : null;
            user.setUsername(newUsername);
        }
        if (body.containsKey("bio")) {
            user.setBio(body.get("bio"));
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
