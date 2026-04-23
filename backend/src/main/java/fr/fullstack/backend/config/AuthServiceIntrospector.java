package fr.fullstack.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.security.oauth2.server.resource.introspection.OAuth2IntrospectionException;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Collections;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Validates opaque Bearer tokens by calling the Laravel auth service's
 * {@code GET /api/user} endpoint. Because Spring Security invokes this
 * introspector on every single authenticated request, and Laravel's
 * {@code /api/*} routes are rate-limited (default 60 req/min/IP), a
 * naive implementation quickly saturates the limiter — Laravel starts
 * returning 429, which this introspector used to translate into
 * "token rejected" and triggered a cascading refresh-loop in the
 * frontend.
 *
 * To avoid that we:
 *   1. Cache successful introspections for {@link #SUCCESS_TTL_MILLIS}
 *      (keyed by a SHA-256 hash of the token, not the token itself).
 *   2. Treat 429 / 5xx from Laravel as a transient upstream failure
 *      rather than a bad credential — we fall back to a slightly-stale
 *      cached entry if we have one (up to {@link #STALE_TTL_MILLIS}),
 *      otherwise throw a plain {@link OAuth2IntrospectionException}
 *      which Spring Security translates into 500 rather than 401 and
 *      keeps the frontend out of a refresh loop.
 *   3. Only 401 from Laravel is a definitive "bad token" signal — it
 *      throws {@link BadOpaqueTokenException} (→ 401 for the client).
 */
@Component
public class AuthServiceIntrospector implements OpaqueTokenIntrospector {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceIntrospector.class);

    /** Fresh cache lifetime — how long a successful introspection is reused without re-validating. */
    private static final long SUCCESS_TTL_MILLIS = 60_000L; // 1 minute
    /** Grace period during which we serve a stale cached entry if Laravel is unreachable / rate-limited. */
    private static final long STALE_TTL_MILLIS = 5 * 60_000L; // 5 minutes

    private final String authUserUrl;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public AuthServiceIntrospector(@Value("${AUTH_URL:http://auth}") String authUrl) {
        this.authUserUrl = authUrl + "/api/user";
    }

    @Override
    public OAuth2AuthenticatedPrincipal introspect(String token) {
        if (token == null || token.isBlank()) {
            throw new BadOpaqueTokenException("Empty token");
        }

        final String key = fingerprint(token);
        final long now = System.currentTimeMillis();

        CacheEntry cached = cache.get(key);
        if (cached != null && now < cached.freshUntilMillis) {
            return cached.principal;
        }

        HttpResponse<String> response;
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(authUserUrl))
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            // Network / timeout — treat as transient. Serve stale if possible.
            return serveStaleOrThrow(cached, now, "Auth service unreachable: " + e.getMessage());
        }

        int status = response.statusCode();

        if (status == 200) {
            try {
                JsonNode body = objectMapper.readTree(response.body());
                int userId = body.get("id").asInt();
                SimpleOAuth2Principal principal = new SimpleOAuth2Principal(userId);
                cache.put(key, new CacheEntry(principal, now + SUCCESS_TTL_MILLIS, now + STALE_TTL_MILLIS));
                return principal;
            } catch (Exception e) {
                // Malformed 200 body is technically an upstream bug — prefer stale over a hard fail.
                return serveStaleOrThrow(cached, now, "Malformed auth-service response: " + e.getMessage());
            }
        }

        if (status == 401) {
            // Definitive rejection — drop any cached entry so we don't serve a revoked token.
            cache.remove(key);
            throw new BadOpaqueTokenException("Token rejected by auth service");
        }

        if (status == 429 || status >= 500) {
            // Rate-limited or auth-service 5xx. This is NOT a credential failure.
            // Prefer a slightly-stale cached principal if we have one, so admin
            // browsing stays smooth during bursts. Otherwise propagate as a
            // service error (→ 500, not 401 — frontend won't refresh-loop).
            log.warn("Auth service returned {} for token introspection; falling back to cache if available", status);
            return serveStaleOrThrow(cached, now,
                    "Auth service transient failure (HTTP " + status + ")");
        }

        // Other 4xx — treat as bad token (conservative).
        cache.remove(key);
        throw new BadOpaqueTokenException("Token rejected by auth service (HTTP " + status + ")");
    }

    private OAuth2AuthenticatedPrincipal serveStaleOrThrow(CacheEntry cached, long now, String reason) {
        if (cached != null && now < cached.staleUntilMillis) {
            log.debug("Serving stale cached principal ({} ms old) while auth service is degraded", now - (cached.freshUntilMillis - SUCCESS_TTL_MILLIS));
            return cached.principal;
        }
        throw new OAuth2IntrospectionException(reason);
    }

    private static String fingerprint(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(token.getBytes()));
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is always available on standard JDKs.
            throw new IllegalStateException(e);
        }
    }

    private record CacheEntry(
            OAuth2AuthenticatedPrincipal principal,
            long freshUntilMillis,
            long staleUntilMillis
    ) {}

    public record SimpleOAuth2Principal(int userId) implements OAuth2AuthenticatedPrincipal {
        @Override public String getName() { return String.valueOf(userId); }
        @Override public Map<String, Object> getAttributes() { return Collections.emptyMap(); }
        @Override public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() { return Collections.emptyList(); }
    }
}
