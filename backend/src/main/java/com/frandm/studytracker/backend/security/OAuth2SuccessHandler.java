package com.frandm.studytracker.backend.security;

import com.frandm.studytracker.backend.model.AuthIdentity;
import com.frandm.studytracker.backend.model.User;
import com.frandm.studytracker.backend.model.enums.AuthProvider;
import com.frandm.studytracker.backend.repository.AuthIdentityRepository;
import com.frandm.studytracker.backend.repository.UserRepository;
import com.frandm.studytracker.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final AuthIdentityRepository authIdentityRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final com.frandm.studytracker.backend.security.AuthCookies authCookies;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository,
                                AuthIdentityRepository authIdentityRepository,
                                JwtTokenProvider jwtTokenProvider,
                                TokenService tokenService,
                                com.frandm.studytracker.backend.security.AuthCookies authCookies) {
        this.userRepository = userRepository;
        this.authIdentityRepository = authIdentityRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenService = tokenService;
        this.authCookies = authCookies;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String providerUserId = oAuth2User.getAttribute("sub");
        String email = Optional.ofNullable((String) oAuth2User.getAttribute("email"))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(value -> !value.isBlank())
                .orElseThrow(() -> new IllegalStateException("Google account email is missing"));
        Object emailVerifiedAttribute = oAuth2User.getAttribute("email_verified");
        if (!Boolean.TRUE.equals(emailVerifiedAttribute)) {
            throw new IllegalStateException("Google account email is not verified");
        }
        String name = oAuth2User.getAttribute("name");
        String picture = Optional.ofNullable((String) oAuth2User.getAttribute("picture"))
                .orElse((String) oAuth2User.getAttribute("avatar_url"));
        
        // Find or create user
        User user = authIdentityRepository
                .findByProviderAndProviderUserId(AuthProvider.google, providerUserId)
                .map(AuthIdentity::getUserId)
                .flatMap(userRepository::findById)
                .orElseGet(() -> {
                    Optional<User> existing = userRepository.findByEmail(email);
                    User u = existing.orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setDisplayName(name);
                        newUser.setAvatarUrl(picture);
                        return newUser;
                    });
                    if (u.getEmailVerifiedAt() == null) u.setEmailVerifiedAt(OffsetDateTime.now());
                    userRepository.save(u);

                    AuthIdentity identity = new AuthIdentity();
                    identity.setUserId(u.getId());
                    identity.setProvider(AuthProvider.google);
                    identity.setProviderUserId(providerUserId);
                    authIdentityRepository.save(identity);

                    return u;
                });

        user.setEmailVerifiedAt(user.getEmailVerifiedAt() == null ? OffsetDateTime.now() : user.getEmailVerifiedAt());
        if (!user.isActive()) throw new IllegalStateException("Account is inactive");
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = tokenService.createRefreshToken(user.getId(), request);

        authCookies.setTokens(response, accessToken, refreshToken);
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                .build().toUriString();
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
