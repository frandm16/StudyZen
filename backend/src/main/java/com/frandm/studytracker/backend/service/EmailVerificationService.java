package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.model.VerificationToken;
import com.frandm.studytracker.backend.model.enums.TokenPurpose;
import com.frandm.studytracker.backend.repository.UserRepository;
import com.frandm.studytracker.backend.repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class EmailVerificationService {
    private final VerificationTokenRepository verificationTokenRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final String frontendUrl;
    private final String fromAddress;
    private final SecureRandom secureRandom = new SecureRandom();

    public EmailVerificationService(VerificationTokenRepository verificationTokenRepository,
                                    UserRepository userRepository, JavaMailSender mailSender,
                                    @Value("${app.frontend-url}") String frontendUrl,
                                    @Value("${app.mail.from}") String fromAddress) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
        this.fromAddress = fromAddress;
    }

    @Transactional
    public void sendToken(User user, TokenPurpose purpose) {
        verificationTokenRepository.deleteByUserIdAndPurposeAndUsedAtIsNull(user.getId(), purpose);
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        VerificationToken token = new VerificationToken();
        token.setUserId(user.getId());
        token.setPurpose(purpose);
        token.setTokenHash(hash(raw));
        token.setExpiresAt(OffsetDateTime.now().plusMinutes(purpose == TokenPurpose.email_verification ? 24 * 60 : 60));
        verificationTokenRepository.save(token);
        String action = purpose == TokenPurpose.email_verification ? "verify-email" : "reset-password";
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject(purpose == TokenPurpose.email_verification ? "Verify your StudyZen email" : "Reset your StudyZen password");
        message.setText("Use this link to continue: " + frontendUrl + "/" + action + "?token=" + raw);
        mailSender.send(message);
    }

    @Transactional
    public void verify(String raw) {
        User user = claimUser(raw, TokenPurpose.email_verification);
        user.setEmailVerifiedAt(OffsetDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public User consume(String raw, TokenPurpose purpose) {
        return claimUser(raw, purpose);
    }

    private User claimUser(String raw, TokenPurpose purpose) {
        if (raw == null || raw.isBlank()) throw new IllegalArgumentException("Invalid or expired token");
        String tokenHash = hash(raw);
        VerificationToken token = verificationTokenRepository.findByTokenHashAndPurposeAndUsedAtIsNull(tokenHash, purpose)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
        OffsetDateTime now = OffsetDateTime.now();
        if (!token.getExpiresAt().isAfter(now)
                || verificationTokenRepository.claimValidToken(tokenHash, purpose, now) != 1) {
            throw new IllegalArgumentException("Invalid or expired token");
        }
        return userRepository.findById(token.getUserId()).orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
    }

    private String hash(String raw) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to process token", exception);
        }
    }
}
