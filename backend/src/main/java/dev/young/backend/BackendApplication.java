package dev.young.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAsync
@EnableScheduling
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
//@SecurityScheme(
//        name = "keycloak",
//        type = SecuritySchemeType.OAUTH2,
//        bearerFormat = "JWT",
//        scheme = "bearer",
//        in = SecuritySchemeIn.HEADER,
//        flows = @OAuthFlows(
//                password = @OAuthFlow(
//                        authorizationUrl = "http://localhost:9092/realms/umi/protocol/openid-connect/auth",
//                        tokenUrl = "http://localhost:9092/realms/umi/protocol/openid-connect/token"
//                )
//        )
//)
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}