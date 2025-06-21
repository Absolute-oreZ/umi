package dev.young.backend.controller;

import dev.young.backend.dto.PagedResponse;
import dev.young.backend.entity.Resource;
import dev.young.backend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping("/query")
    public ResponseEntity<PagedResponse<Resource>> getResourcesByQueryAndCategory(
            @RequestParam String query,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page
    ) {
        Page<Resource> result = resourceService.queryResources(query, category, page);

        return ResponseEntity.ok(new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalPages(),
                result.getTotalElements()
        ));
    }

    @PostMapping("/new")
    public void uploadSharedResource(@RequestParam("file") MultipartFile file, @RequestParam(value = "renameText", required = false) String renameText) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        resourceService.uploadResource(file, renameText);
    }
}