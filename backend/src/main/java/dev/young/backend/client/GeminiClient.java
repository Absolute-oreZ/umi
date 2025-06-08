package dev.young.backend.client;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GeminiClient {

    @Value("${application.gemini-ai.base-url}")
    private String baseUrl;
    @Value("${application.gemini-ai.api-key}")
    private String apiKey;
    @Value("${application.gemini-ai.model}")
    private String model;

    private WebClient webClient;

    @PostConstruct
    private void init() {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public Mono<String> ask(String prompt) {
        String endpoint = String.format("/v1beta/models/%s:generateContent?key=%s",model, apiKey);

        Map<String, Object> requestBody = Map.of(
                "contents", Collections.singletonList(
                        Map.of("parts", Collections.singletonList(
                                Map.of("text", prompt)
                        ))
                )
        );

        return webClient.post()
                .uri(endpoint)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    try {
                        Map<?, ?> candidate = (Map<?, ?>) ((java.util.List<?>) response.get("candidates")).get(0);
                        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                        java.util.List<?> parts = (java.util.List<?>) content.get("parts");
                        return (String) ((Map<?, ?>) parts.get(0)).get("text");
                    } catch (Exception e) {
                        return "I'm sorry, I couldn't process that right now.";
                    }
                })
                .onErrorReturn("I'm sorry, I couldn't process that right now.");
    }
}