package dev.young.backend.filter;

import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

public class SupabaseAuthenticationToken extends AbstractAuthenticationToken {
    private final UUID principal;
    @Getter
    private final Map<String,Object> claims;

    public SupabaseAuthenticationToken(UUID principal, Map<String,Object> claims){
        super(Collections.emptyList());
        this.principal = principal;
        this.claims = claims;
        super.setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public UUID getPrincipal() {
        return principal;
    }

}