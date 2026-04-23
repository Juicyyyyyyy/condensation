package fr.fullstack.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AuthProxyService {

    public enum AdminCheck {
        /** Token is valid and belongs to an admin user. */
        OK,
        /** Token is missing, malformed, or rejected by auth service. */
        UNAUTHORIZED,
        /** Token is valid but user is not admin. */
        FORBIDDEN,
        /** Auth service is unreachable or returned 5xx — caller should return 503. */
        SERVICE_UNAVAILABLE
    }

    public static final class AdminResult {
        public final AdminCheck status;
        public final String token;

        private AdminResult(AdminCheck status, String token) {
            this.status = status;
            this.token = token;
        }
    }

    private static final int MAX_ATTEMPTS = 2;
    private static final long RETRY_BACKOFF_MS = 250L;

    private final RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    public AuthProxyService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Calls the auth service GET /api/user with the provided Bearer token.
     * Returns the raw JSON response body, or null if the token is invalid.
     */
    public String getUserJson(String bearerToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", bearerToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    authServiceUrl + "/api/user",
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Validates that the Bearer token belongs to an admin user.
     * Retries once on transient network / 5xx failures.
     */
    @SuppressWarnings("unchecked")
    public AdminResult checkAdmin(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return new AdminResult(AdminCheck.UNAUTHORIZED, null);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                ResponseEntity<Map> response = restTemplate.exchange(
                        authServiceUrl + "/api/user",
                        HttpMethod.GET,
                        entity,
                        Map.class
                );
                if (!response.getStatusCode().is2xxSuccessful()) {
                    return new AdminResult(AdminCheck.UNAUTHORIZED, null);
                }
                Map<String, Object> user = response.getBody();
                if (user == null) {
                    return new AdminResult(AdminCheck.SERVICE_UNAVAILABLE, null);
                }
                return "admin".equals(user.get("role"))
                        ? new AdminResult(AdminCheck.OK, bearerToken)
                        : new AdminResult(AdminCheck.FORBIDDEN, null);
            } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden e) {
                return new AdminResult(AdminCheck.UNAUTHORIZED, null);
            } catch (HttpClientErrorException e) {
                // Other 4xx — treat as auth failure, don't retry.
                return new AdminResult(AdminCheck.UNAUTHORIZED, null);
            } catch (HttpServerErrorException | ResourceAccessException e) {
                // Transient — retry once, then give up as service error.
                if (attempt >= MAX_ATTEMPTS) {
                    return new AdminResult(AdminCheck.SERVICE_UNAVAILABLE, null);
                }
                sleep(RETRY_BACKOFF_MS);
            } catch (Exception e) {
                return new AdminResult(AdminCheck.SERVICE_UNAVAILABLE, null);
            }
        }
        return new AdminResult(AdminCheck.SERVICE_UNAVAILABLE, null);
    }

    /**
     * Back-compat wrapper. Prefer checkAdmin(...) which distinguishes failure modes.
     */
    public String requireAdminToken(String bearerToken) {
        AdminResult result = checkAdmin(bearerToken);
        return result.status == AdminCheck.OK ? result.token : null;
    }

    /**
     * Runs the admin check and returns an error ResponseEntity if it fails,
     * or null if the caller is authorized. Intended for use as a guard:
     *
     *     ResponseEntity<?> err = authProxyService.adminGuard(auth);
     *     if (err != null) return err;
     */
    public ResponseEntity<?> adminGuard(String bearerToken) {
        AdminResult result = checkAdmin(bearerToken);
        switch (result.status) {
            case OK:
                return null;
            case UNAUTHORIZED:
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            case FORBIDDEN:
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Forbidden"));
            case SERVICE_UNAVAILABLE:
            default:
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "Auth service unavailable"));
        }
    }

    /**
     * Proxies a request to the auth service and returns the raw response.
     */
    public ResponseEntity<String> proxy(String path, HttpMethod method, String bearerToken, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", bearerToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = (body != null) ? new HttpEntity<>(body, headers) : new HttpEntity<>(headers);
            return restTemplate.exchange(authServiceUrl + path, method, entity, String.class);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"Auth service unreachable\"}");
        }
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
