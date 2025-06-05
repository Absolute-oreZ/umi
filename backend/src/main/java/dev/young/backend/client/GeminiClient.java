package dev.young.backend.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GeminiClient {

    @Value("${application.gemini-ai.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY";

    public String ask(String prompt) {
        // construct the request payload
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(
                Map.of("parts", Collections.singletonList(Map.of("text", prompt)))
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    GEMINI_API_URL.replace("YOUR_API_KEY", apiKey),
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map content = (Map) ((Map) ((java.util.List<?>) response.getBody().get("candidates")).get(0)).get("content");
            java.util.List<?> parts = (java.util.List<?>) content.get("parts");
            return (String) ((Map<?, ?>) parts.get(0)).get("text");

        } catch (Exception e) {
            e.printStackTrace();
            return "I'm sorry, I couldn't process that right now.";
        }
    }
}