package dev.young.backend.service;

import dev.young.backend.entity.Resource;
import dev.young.backend.enums.FileType;
import dev.young.backend.repository.ResourceRepository;
import dev.young.backend.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final SupabaseStorageService supabaseStorageService;
    private final ResourceRepository resourceRepository;

    public void uploadResource(MultipartFile file) {
        FileType category = FileUtil.mapFileTypeFromExtension(file);

        String resourcePath = supabaseStorageService.uploadSharedResource(file, String.valueOf(category).toLowerCase());
        Resource savedResource = Resource
                .builder()
                .name(FileUtil.getOriginalNameWithoutExtension(file))
                .resourcePath(resourcePath)
                .category(category)
                .build();

        resourceRepository.save(savedResource);
    }

    public List<Resource> queryResources(String query, String category){
        if(category != null){
            FileType category2 = FileUtil.mapStringCategoryToFileType(category);
            return resourceRepository.searchByQueryAndCategory(query,category2);
        }
        return resourceRepository.searchByQuery(query);
    }
}