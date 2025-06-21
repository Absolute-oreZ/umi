package dev.young.backend.service;

import dev.young.backend.entity.Resource;
import dev.young.backend.enums.FileType;
import dev.young.backend.repository.ResourceRepository;
import dev.young.backend.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final SupabaseStorageService supabaseStorageService;
    private final ResourceRepository resourceRepository;

    public void uploadResource(MultipartFile file,String renameText) {
        FileType category = FileUtil.mapFileTypeFromExtension(file);
        String fileName = renameText == null ? FileUtil.getOriginalNameWithoutExtension(file) : renameText;

        String resourcePath = supabaseStorageService.uploadSharedResource(file, String.valueOf(category).toLowerCase(),fileName);
        Resource savedResource = Resource
                .builder()
                .name(fileName)
                .resourcePath(resourcePath)
                .category(category)
                .build();

        resourceRepository.save(savedResource);
    }

    public Page<Resource> queryResources(String query, String category, int page){
        Pageable paging = PageRequest.of(page, 3);
        FileType categoryEnum = (category != null) ? FileUtil.mapStringCategoryToFileType(category) : null;
        System.out.println("query: " + query + ", category: " + category + ", page: " + page +", categoryEnum: " + categoryEnum);
        Page<Resource> resources = resourceRepository.searchByQueryAndOptionalCategory(query,categoryEnum,paging);
        System.out.println(resources.getContent());
        return resourceRepository.searchByQueryAndOptionalCategory(query, categoryEnum, paging);
    }
}