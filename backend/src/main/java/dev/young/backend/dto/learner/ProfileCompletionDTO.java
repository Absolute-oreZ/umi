package dev.young.backend.dto.learner;

import dev.young.backend.dto.learning_preference.LearningPreferenceDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileCompletionDTO {
    @NotBlank(message = "keycloakUserId cannot be blank")
    private String keycloakUserId;

    @NotBlank(message = "Email cannot be blank")
    private String email;

    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotNull(message = "Learning Preference cannot be null")
    private LearningPreferenceDTO learningPreferenceDTO;
}