package backend.service;

import backend.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    public String generateToken(User user) {
        long now = Instant.now().toEpochMilli();
        long expiresAt = now + expirationMs;
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = String.format(
                "{\"sub\":\"%s\",\"uid\":%d,\"name\":\"%s %s\",\"iat\":%d,\"exp\":%d}",
                escape(user.getEmail()),
                user.getId(),
                escape(user.getFirstName()),
                escape(user.getLastName()),
                now / 1000,
                expiresAt / 1000
        );
        String body = encode(header) + "." + encode(payload);
        String token = body + "." + sign(body);
        log.info("Generated token for user: {}", user.getEmail());
        return token;
    }

    public boolean isValid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                log.warn("Token has {} parts, expected 3", parts.length);
                return false;
            }

            String body = parts[0] + "." + parts[1];
            String expectedSignature = sign(body);
            String providedSignature = parts[2];

            log.info("Expected signature: {}", expectedSignature);
            log.info("Provided signature: {}", providedSignature);

            if (!constantTimeEquals(expectedSignature, providedSignature)) {
                log.warn("Signature mismatch!");
                return false;
            }

            Long expiresAt = extractLongClaim(token, "exp");
            long now = Instant.now().getEpochSecond();
            log.info("Token expires at: {}, now: {}", expiresAt, now);

            if (expiresAt == null) {
                log.warn("Expiration claim not found");
                return false;
            }

            if (expiresAt <= now) {
                log.warn("Token is expired");
                return false;
            }

            log.info("Token is valid");
            return true;
        } catch (Exception e) {
            log.error("JWT validation error", e);
            return false;
        }
    }

    public String extractEmail(String token) {
        return extractStringClaim(token, "sub");
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to sign JWT", e);
        }
    }

    private String encode(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String payload(String token) {
        String[] parts = token.split("\\.");
        return new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
    }

    private String extractStringClaim(String token, String claim) {
        String payload = payload(token);
        String marker = "\"" + claim + "\":\"";
        int start = payload.indexOf(marker);
        if (start < 0) {
            return null;
        }
        start += marker.length();
        int end = payload.indexOf("\"", start);
        return end < 0 ? null : payload.substring(start, end);
    }

    private Long extractLongClaim(String token, String claim) {
        String payload = payload(token);
        String marker = "\"" + claim + "\":";
        int start = payload.indexOf(marker);
        if (start < 0) {
            return null;
        }
        start += marker.length();
        int end = start;
        while (end < payload.length() && Character.isDigit(payload.charAt(end))) {
            end++;
        }
        return Long.parseLong(payload.substring(start, end));
    }

    private boolean constantTimeEquals(String first, String second) {
        return MessageDigest.isEqual(
                first.getBytes(StandardCharsets.UTF_8),
                second.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}