package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.RefreshToken;
import com.frandm.studytracker.backend.repository.RefreshTokenRepository;
import com.frandm.studytracker.backend.repository.UserRepository;
import com.frandm.studytracker.backend.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final long refreshTokenExpiryMs;

    public TokenService(RefreshTokenRepository refreshTokenRepository,
                        JwtTokenProvider jwtTokenProvider,
                        @Value("${app.jwt.refresh-token-expiry-ms}") long refreshTokenExpiryMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenExpiryMs = refreshTokenExpiryMs;
    }

    public String createRefreshToken(UUID userId, HttpServletRequest request) {
        String rawToken = generateSecureToken();
        String tokenHash = sha256(rawToken);

        RefreshToken entity = new RefreshToken();
        entity.setUserId(userId);
        entity.setTokenHash(tokenHash);
        entity.setUserAgent(request != null ? request.getHeader("User-Agent") : null);
        entity.setIpAddress(request != null ? request.getRemoteAddr() : null);
        entity.setExpiresAt(OffsetDateTime.now().plusSeconds(refreshTokenExpiryMs / 1000));
        refreshTokenRepository.save(entity);

        return rawToken;
    }

    public record TokenPair(String accessToken, String refreshToken) {}

    public TokenPair rotateRefreshToken(String rawRefreshToken,
                                        UserRepository userRepository,
                                        HttpServletRequest request) {
        String hash = sha256(rawRefreshToken);
        RefreshToken existing = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash)
                .orElseThrow(() -> new RuntimeException("Invalid or revoked refresh token"));

        if (existing.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        var user = userRepository.findById(existing.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Revoke old token
        existing.setRevokedAt(OffsetDateTime.now());

        // Create new refresh token
        String newRaw = generateSecureToken();
        String newHash = sha256(newRaw);
        RefreshToken newToken = new RefreshToken();
        newToken.setUserId(existing.getUserId());
        newToken.setTokenHash(newHash);
        newToken.setUserAgent(request != null ? request.getHeader("User-Agent") : null);
        newToken.setIpAddress(request != null ? request.getRemoteAddr() : null);
        newToken.setExpiresAt(OffsetDateTime.now().plusSeconds(refreshTokenExpiryMs / 1000));
        refreshTokenRepository.save(newToken);

        existing.setReplacedByTokenId(newToken.getId());
        refreshTokenRepository.save(existing);

        String newAccess = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        return new TokenPair(newAccess, newRaw);
    }

    public void revokeAllUserTokens(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId, OffsetDateTime.now());
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
