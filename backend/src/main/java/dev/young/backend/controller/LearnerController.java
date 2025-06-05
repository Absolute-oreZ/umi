package dev.young.backend.controller;

import dev.young.backend.dto.learner.LearnerDTO;
import dev.young.backend.dto.learning_preference.LearningPreferenceDTO;
import dev.young.backend.service.LearnerService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/learners")
@RequiredArgsConstructor
@Tag(name = "Learner")
public class LearnerController {

    private final LearnerService learnerService;

    @GetMapping("/profile")
    public ResponseEntity<LearnerDTO> getProfile(Authentication connectedUser) {
        LearnerDTO learnerDTO = learnerService.getProfile(connectedUser);
        return ResponseEntity.ok(learnerDTO);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<LearnerDTO> getProfile(@PathVariable String username) {
        LearnerDTO learnerDTO = learnerService.getProfile(username);
        return ResponseEntity.ok(learnerDTO);
    }

    @PutMapping("/update-learning-preference")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void updateLearningPreference(
            @Valid @RequestBody LearningPreferenceDTO learningPreferenceDTO,
            Authentication connectedUser
    ) {
        learnerService.updateLearningPreference(learningPreferenceDTO, connectedUser);
    }

    @PostMapping(value = "/upload-profile-picture", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void addLearningPreference(
            @Parameter()
            @RequestPart("profilePicture") MultipartFile profilePicture,
            Authentication connectedUser
    ) {
        learnerService.uploadProfilePicture(profilePicture, connectedUser);
    }
}