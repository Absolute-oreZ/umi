package dev.young.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileUpdateDTO {
//    @NotBlank(message = "keycloakUserId cannot be blank")
//    private String keycloakUserId;
    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotNull(message = "Learning Preference cannot be null")
    private LearningPreferenceDTO learningPreferenceDTO;
}