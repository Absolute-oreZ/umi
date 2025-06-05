package dev.young.backend.client;

import dev.young.backend.dto.exception.ClusterServiceException;
import dev.young.backend.dto.learning_preference.LearningPreferenceDTO;
import dev.young.backend.dto.recommendation.ClusterPredictionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class FlaskClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String serviceToken;

    public Integer predictCluster(LearningPreferenceDTO learningPreferenceDTO) {
        Map<String, Object> request = new HashMap<>();
        request.put("learningStyles", learningPreferenceDTO.getLearningStyles());
        request.put("personality", learningPreferenceDTO.getPersonality());
        request.put("country", learningPreferenceDTO.getCountry());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ClusterPredictionResponse response =  restTemplate.exchange(
                    baseUrl + "/predict-cluster",
                    HttpMethod.POST,
                    entity,
                    ClusterPredictionResponse.class
            ).getBody();

            return response != null ? response.getClusterId() : -1;
        } catch (RestClientException e) {
            throw new ClusterServiceException("Prediction request failed: " + e.getMessage());
        }
    }

    public boolean isServiceHealthy() {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    baseUrl + "/health",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                return false;
            }

            Map<String, Object> body = response.getBody();
            return body != null
                    && "healthy".equalsIgnoreCase((String) body.get("status"))
                    && Boolean.TRUE.equals(body.get("model_loaded"));
        } catch (Exception e) {
            return false;
        }
    }
}