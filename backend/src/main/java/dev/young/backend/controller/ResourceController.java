package dev.young.backend.controller;

import dev.young.backend.entity.Resource;
import dev.young.backend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping("/query")
    public List<Resource> getResourcesByQueryAndCategory(
            @RequestParam String query,
            @RequestParam(required = false) String category
    ){
        return resourceService.queryResources(query,category);
    }

    @PostMapping("/new")
    public void uploadSharedResource(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        resourceService.uploadResource(file);
    }
}