package dev.young.backend.client;

import dev.young.backend.dto.user.LearningPreferenceDTO;
import dev.young.backend.dto.recommendation.ClusterPredictionResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class FlaskClient {
    //
    @Value("${application.ml-recommendation.base-url}")
    private String baseUrl;

    @Value("${application.ml-recommendation.service-token}")
    private String token;

    private WebClient authClient;
    private WebClient unauthClient;

//    private final RestTemplate restTemplate;
//    private final String baseUrl;
//    private final String serviceToken;
//
//    public Integer predictCluster(LearningPreferenceDTO learningPreferenceDTO) {
//        Map<String, Object> request = new HashMap<>();
//        request.put("learningStyles", learningPreferenceDTO.getLearningStyles());
//        request.put("personality", learningPreferenceDTO.getPersonality());
//        request.put("country", learningPreferenceDTO.getCountry());
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("Authorization", "Bearer " + serviceToken);
//
//        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
//
//        try {
//            ClusterPredictionResponse response =  restTemplate.exchange(
//                    baseUrl + "/predict-cluster",
//                    HttpMethod.POST,
//                    entity,
//                    ClusterPredictionResponse.class
//            ).getBody();
//
//            return response != null ? response.getClusterId() : -1;
//        } catch (RestClientException e) {
//            throw new ClusterServiceException("Prediction request failed: " + e.getMessage());
//        }
//    }
//
//    public boolean isServiceHealthy() {
//        try {
//            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
//                    baseUrl + "/health",
//                    HttpMethod.GET,
//                    null,
//                    new ParameterizedTypeReference<Map<String, Object>>() {}
//            );
//
//            if (!response.getStatusCode().is2xxSuccessful()) {
//                return false;
//            }
//
//            Map<String, Object> body = response.getBody();
//            return body != null
//                    && "healthy".equalsIgnoreCase((String) body.get("status"))
//                    && Boolean.TRUE.equals(body.get("model_loaded"));
//        } catch (Exception e) {
//            return false;
//        }
//    }


    // Initialize once after Spring injects values
    @PostConstruct
    private void initClients() {
        this.authClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();

        this.unauthClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public Integer predictCluster(LearningPreferenceDTO dto) {
        return authClient.post()
                .uri("/predict-cluster")
                .bodyValue(Map.of(
                        "learningStyles", dto.getLearningStyles(),
                        "personality", dto.getPersonality(),
                        "country", dto.getCountry()
                ))
                .retrieve()
                .bodyToMono(ClusterPredictionResponse.class)
                .map(ClusterPredictionResponse::getClusterId)
                .onErrorReturn(-1)
                .block();
    }

    public boolean isServiceHealthy() {
        return Boolean.TRUE.equals(unauthClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(body -> "healthy".equalsIgnoreCase((String) body.get("status")) &&
                        Boolean.TRUE.equals(body.get("model_loaded")))
                .onErrorReturn(false)
                .block());
    }
}