package dev.young.backend.service;

import dev.young.backend.client.SupabaseClient;
import dev.young.backend.enums.FileType;
import dev.young.backend.util.FileUtil;
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
        String fileExtension = FileUtil.getFileExtension(sourceFile);
        String originalName = FileUtil.getOriginalNameWithoutExtension(sourceFile);
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

    public String uploadSharedResource(
            @Nonnull MultipartFile file,
            @Nonnull String category,
            String fileName
    ) {
        String fileExtension = FileUtil.getFileExtension(file);
        String originalName = fileName == null ? FileUtil.getOriginalNameWithoutExtension(file) : fileName;
        String uploadPath = "shared/" + category;
        String objectPath = uploadPath + "/" + originalName + "." + fileExtension;

        try {
            supabaseClient.putToStorage(objectPath, file.getBytes()).block();
            return buildPublicUrl(objectPath);
        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage(), e);
        }

    }

    private String buildPublicUrl(String objectPath) {
        return String.format("https://%s/storage/v1/object/public/%s/%s",
                supabaseHost(), supabaseBucket, objectPath);
    }

    private String supabaseHost() {
        return supabaseUrl.replace("https://", "").replaceAll("/+$", "");
    }
}