package dev.young.backend.client;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.FileNameMap;
import java.net.URLConnection;

@Component
@RequiredArgsConstructor
public class SupabaseClient {

    @Value("${application.supabase.url}")
    String supabaseUrl;
    @Value("${application.supabase.service-role.key}")
    String supabaseKey;
    @Value("${application.supabase.bucket}")
    String supabaseBucket;

    private WebClient supabaseWebClient;

    @PostConstruct
    private void init() {
        this.supabaseWebClient = WebClient.builder()
                .baseUrl(supabaseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                .build();
    }

    public Mono<String> putToStorage(String path, byte[] fileBytes) {
        String url = String.format("/storage/v1/object/%s/%s", supabaseBucket, path);
        MediaType mediaType = getMediaType(path);

        return supabaseWebClient.put()
                .uri(url)
                .header("x-upsert", "true")
                .contentType(mediaType)
                .bodyValue(fileBytes)
                .retrieve()
                .bodyToMono(String.class);
    }


    private MediaType getMediaType(String path) {
        FileNameMap fileNameMap = URLConnection.getFileNameMap();
        String mimeType = fileNameMap.getContentTypeFor(path);
        if (mimeType != null) {
            return MediaType.parseMediaType(mimeType);
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}