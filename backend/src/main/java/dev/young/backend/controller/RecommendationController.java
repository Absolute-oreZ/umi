package dev.young.backend.controller;

import dev.young.backend.dto.group.GroupDTO;
import dev.young.backend.service.RecommendationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping()
    public ResponseEntity<List<GroupDTO>> getRecommendations(Authentication authentication){
        return ResponseEntity.ok(recommendationService.getRecommendedGroups(authentication));
    }
}