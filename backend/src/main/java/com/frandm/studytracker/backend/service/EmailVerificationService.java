package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.model.VerificationToken;
import com.frandm.studytracker.backend.model.enums.TokenPurpose;
import com.frandm.studytracker.backend.repository.UserRepository;
import com.frandm.studytracker.backend.repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
        String actionUrl = frontendUrl + "/" + action + "?token=" + raw;
        boolean verification = purpose == TokenPurpose.email_verification;
        String subject = verification ? "Verify your StudyZen email" : "Reset your StudyZen password";
        String title = verification ? "A calmer way to stay on track starts here." : "Let’s get you back into StudyZen.";
        String intro = verification
                ? "Thanks for creating a StudyZen account. Confirm your email address to finish setting up your study space."
                : "We received a request to reset the password for your StudyZen account. Use the secure link below to choose a new password.";
        String buttonLabel = verification ? "Verify email address" : "Reset password";
        String expiry = verification ? "This link expires in 24 hours." : "This link expires in 1 hour.";
        String ignore = verification
                ? "If you didn’t create a StudyZen account, you can safely ignore this email."
                : "If you didn’t request a password reset, you can safely ignore this email. Your password will remain unchanged.";
        String plainText = "STUDYZEN\\n\\n" + title + "\\n\\n" + intro + "\\n\\n" + buttonLabel + ":\\n" + actionUrl
                + "\\n\\n" + expiry + "\\n\\n" + ignore + "\\n\\nStudyZen";
        String html = """
                <!doctype html>
                <html lang="en">
                  <body style="margin:0;padding:0;background-color:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#182230;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background-color:#f3f6fb;padding:32px 12px;">
                      <tr><td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e3e9f2;border-radius:18px;overflow:hidden;">
                          <tr><td style="padding:28px 36px 20px;border-bottom:1px solid #edf1f6;">
                            <span style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:10px;background:#eaf2ff;color:#3978d5;font-size:16px;font-weight:bold;">S</span>
                            <span style="margin-left:9px;vertical-align:middle;font-size:17px;font-weight:700;letter-spacing:-0.3px;color:#182230;">StudyZen</span>
                          </td></tr>
                          <tr><td style="padding:34px 36px 14px;">
                            <p style="margin:0 0 12px;color:#3978d5;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">ACCOUNT SECURITY</p>
                            <h1 style="margin:0 0 16px;font-size:25px;line-height:1.3;letter-spacing:-0.6px;color:#182230;">%s</h1>
                            <p style="margin:0;color:#536174;font-size:15px;line-height:1.7;">%s</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 20px;"><tr><td bgcolor="#3978d5" style="border-radius:10px;">
                              <a href="%s" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">%s</a>
                            </td></tr></table>
                            <p style="margin:0;color:#68778b;font-size:13px;line-height:1.6;">%s</p>
                          </td></tr>
                          <tr><td style="padding:0 36px 30px;">
                            <p style="margin:0;color:#68778b;font-size:13px;line-height:1.65;">%s</p>
                            <p style="margin:22px 0 0;color:#99a4b3;font-size:11px;line-height:1.6;">If the button doesn’t work, copy and paste this link into your browser:<br><a href="%s" style="color:#3978d5;word-break:break-all;">%s</a></p>
                          </td></tr>
                          <tr><td style="padding:18px 36px;background:#f8fafd;border-top:1px solid #edf1f6;color:#8995a5;font-size:11px;line-height:1.6;">StudyZen · Plan your work, focus on your studies, and make steady progress.</td></tr>
                        </table>
                      </td></tr>
                    </table>
                  </body>
                </html>
                """.formatted(title, intro, actionUrl, buttonLabel, expiry, ignore, actionUrl, actionUrl);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(plainText, html);
            mailSender.send(message);
        } catch (MessagingException exception) {
            throw new IllegalStateException("Unable to create authentication email", exception);
        }
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
