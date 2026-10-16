package com.frandm.studytracker.backend.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Component
public class AuthCookies {
    public static final String ACCESS_COOKIE = "studyzen_access";
    public static final String REFRESH_COOKIE = "studyzen_refresh";
    private final boolean secure;
    private final long accessExpiryMs;
    private final long refreshExpiryMs;

    public AuthCookies(@Value("${app.cookies.secure:false}") boolean secure,
                       @Value("${app.jwt.access-token-expiry-ms}") long accessExpiryMs,
                       @Value("${app.jwt.refresh-token-expiry-ms}") long refreshExpiryMs) {
        this.secure = secure;
        this.accessExpiryMs = accessExpiryMs;
        this.refreshExpiryMs = refreshExpiryMs;
    }

    public void setTokens(HttpServletResponse response, String access, String refresh) {
        add(response, ACCESS_COOKIE, access, "/", accessExpiryMs);
        add(response, REFRESH_COOKIE, refresh, "/api/auth", refreshExpiryMs);
    }

    public void clear(HttpServletResponse response) {
        add(response, ACCESS_COOKIE, "", "/", 0);
        add(response, REFRESH_COOKIE, "", "/api/auth", 0);
    }

    public String refreshToken(HttpServletRequest request) {
        return request.getCookies() == null ? null : Arrays.stream(request.getCookies())
                .filter(cookie -> REFRESH_COOKIE.equals(cookie.getName()))
                .map(Cookie::getValue).findFirst().orElse(null);
    }

    private void add(HttpServletResponse response, String name, String value, String path, long expiryMs) {
        ResponseCookie cookie = ResponseCookie.from(name, value).httpOnly(true).secure(secure)
                .sameSite("Lax").path(path).maxAge(Duration.ofMillis(expiryMs)).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}