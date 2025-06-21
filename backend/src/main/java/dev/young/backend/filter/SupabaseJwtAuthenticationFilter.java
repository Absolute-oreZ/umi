package dev.young.backend.filter;

import dev.young.backend.config.SecurityConfig;
import dev.young.backend.service.SupabaseJwtService;
import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import static jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

@Component
@RequiredArgsConstructor
public class SupabaseJwtAuthenticationFilter extends OncePerRequestFilter {

    private final SupabaseJwtService supabaseJwtService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        for (String url : SecurityConfig.WHITE_LIST_URL) {
            if (path.startsWith(url)) {
                return true;
            }
        }

        return false;
//        return path.startsWith("/ws/") || (path.equals("/ws"));
    }

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            SecurityContextHolder.clearContext();
            response.setStatus(SC_UNAUTHORIZED);
            return;
        }

        String token = authHeader.substring(7);

        try {
            Map<String, Object> claims = supabaseJwtService.validateAndParseToken(token);

            Object sub = claims.get("sub");

            if (!(sub instanceof String)) {
                throw new IllegalArgumentException("Invalid sub claim");
            }
            UUID userId = UUID.fromString((String) sub);

            // create authentication
            SupabaseAuthenticationToken authentication =
                    new SupabaseAuthenticationToken(userId, claims);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            response.setStatus(SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}