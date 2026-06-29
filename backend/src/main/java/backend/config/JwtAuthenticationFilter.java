package backend.config;

import backend.model.User;
import backend.repository.UserRepository;
import backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                if (jwtService.isValid(token)) {
                    String email = jwtService.extractEmail(token);
                    log.info("JWT valid for email: {}", email);

                    userRepository.findByEmail(email).ifPresent(user -> {
                        log.info("User found: {}, setting authentication", email);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        user,  // <-- Pass User object, not email string
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                                );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.info("Authentication set. Authorities: {}", authentication.getAuthorities());
                    });
                } else {
                    log.warn("JWT validation failed for token");
                }
            } catch (Exception e) {
                log.error("JWT filter error", e);
            }
        }

        filterChain.doFilter(request, response);
    }
}