package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.repository.UserRepository;
import com.frandm.studytracker.backend.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;

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
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setDisplayName(displayName);
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), email);
        String refreshToken = tokenService.createRefreshToken(user.getId(), request);
        return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
    }

    public Map<String, String> login(String email, String password,
                                      HttpServletRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (user.getPasswordHash() == null ||
                !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), email);
        String refreshToken = tokenService.createRefreshToken(user.getId(), request);
        return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
    }

    public Map<String, String> refresh(String rawRefreshToken, HttpServletRequest request) {
        TokenService.TokenPair pair = tokenService.rotateRefreshToken(rawRefreshToken,
                userRepository, request);
        return Map.of("accessToken", pair.accessToken(), "refreshToken", pair.refreshToken());
    }
}
