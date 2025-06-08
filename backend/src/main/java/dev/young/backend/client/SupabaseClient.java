package dev.young.backend.client;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class SupabaseClient {

    @Value("${application.supabase.url}")
    String supabaseUrl;
    @Value("${application.supabase.key}")
    String supabaseKey;
    @Value("${application.supabase.bucket}")
    String supabaseBucket;

    private final WebClient.Builder webClientBuilder;
    private WebClient supabaseWebClient;

    @PostConstruct
    private void init() {
        this.supabaseWebClient = webClientBuilder
                .baseUrl(supabaseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                .defaultHeader("apiKey", supabaseKey)
                .build();
    }

    public Mono<String> putToStorage(String path, byte[] fileBytes) {
        String url = String.format("/storage/v1/object/%s/%s", supabaseBucket, path);

        return supabaseWebClient.put()
                .uri(url)
                .header("x-upsert", "true")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .bodyValue(fileBytes)
                .retrieve()
                .bodyToMono(String.class);
    }
}