package dev.young.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

@Configuration
public class ApplicationAuditAwareConfig implements AuditorAware<UUID> {

    @Value(("${application.bot.id}"))
    private String botId;

    @Override
    public Optional<UUID> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            // return a fixed default auditor for bot actions
            return Optional.of(UUID.fromString(botId));
        }

        return Optional.ofNullable((UUID) authentication.getPrincipal());
    }

    @Bean
    public AuditorAware<UUID> auditorAware(){
        return new ApplicationAuditAwareConfig();
    }
}