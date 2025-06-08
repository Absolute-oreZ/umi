package dev.young.backend.service;

import dev.young.backend.client.SupabaseClient;
import dev.young.backend.enums.FileType;
import jakarta.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    @Value("${application.supabase.url}")
    private String supabaseUrl;

    @Value("${application.supabase.bucket}")
    private String supabaseBucket;

    private final SupabaseClient supabaseClient;

    public String uploadFile(
            @Nonnull MultipartFile sourceFile,
            @Nonnull String rootFolder,
            @Nonnull String id,
            @Nonnull FileType fileType
    ) {
        String fileExtension = getFileExtension(sourceFile.getOriginalFilename());
        String originalName = originalNameWithoutExtension(sourceFile.getOriginalFilename());
        String uploadPath = rootFolder + "/" + id + "/" + fileType.getName();
        String objectPath = uploadPath + "/" + originalName + "." + fileExtension;

        try {
            // This will block the thread until the request is completed
            supabaseClient.putToStorage(objectPath, sourceFile.getBytes()).block();
            return buildPublicUrl(objectPath);
        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage(), e);
        }
    }

    private String getFileExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) {
            return "";
        }

        int lastDotIndex = originalFilename.lastIndexOf('.');

        if (lastDotIndex == -1) {
            return "";
        }

        return originalFilename.substring(lastDotIndex + 1).toLowerCase();
    }

    private String originalNameWithoutExtension(String filename) {
        if (filename == null || filename.isEmpty()) return "file";
        int dot = filename.lastIndexOf(".");
        String fileName = dot == -1 ? filename : filename.substring(0, dot);
        return fileName.toLowerCase().replaceAll("\\s+", "_");
    }

    private String buildPublicUrl(String objectPath) {
        return String.format("https://%s/storage/v1/object/public/%s/%s",
                supabaseHost(), supabaseBucket, objectPath);
    }

    private String supabaseHost() {
        return supabaseUrl.replace("https://", "").replaceAll("/+$", "");
    }
}