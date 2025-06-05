package dev.young.backend.config;

import dev.young.backend.client.FlaskClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class FlaskClientConfig {

    @Value("${ml-recommendation.url}")
    private String mlRecommendationUrl;

    @Value("${ml-recommendation.service-token}")
    private String serviceToken;

    @Bean
    public RestTemplate flaskRestTemplate() {
        return new RestTemplate();
    }

    @Bean
    public FlaskClient flaskClient() {
        return new FlaskClient(
                flaskRestTemplate(),
                mlRecommendationUrl,
                serviceToken
        );
    }
}