package dev.young.backend.config;

import dev.young.backend.filter.ExpiredTokenFilter;
import dev.young.backend.filter.SupabaseJwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final ExpiredTokenFilter expiredTokenFilter;
    private final SupabaseJwtAuthenticationFilter supabaseJwtAuthenticationFilter;

    public static final String[] WHITE_LIST_URL = {
            "/auth/**",
            "/v2/api-docs",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/swagger-resources",
            "/swagger-resources/**",
            "/configuration/ui",
            "/configuration/security",
            "/swagger-ui/**",
            "/webjars/**",
            "/swagger-ui.html",
            "/ws/**",
            "/ws",
            "/actuator",
            "/actuator/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(c -> c.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(request -> request
                        .requestMatchers(WHITE_LIST_URL).permitAll()
                        .anyRequest().authenticated()
                )
                // used keycoak identity provided
                // migrated to SupaBase auth
//                .oauth2ResourceServer(auth ->
//                        auth.jwt(token -> token.jwtAuthenticationConverter(new JwtAuthenticationConverter())))
                .addFilterBefore(expiredTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(supabaseJwtAuthenticationFilter, ExpiredTokenFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
}