package dev.young.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class LearningPreferenceDTO {
    @NotBlank(message = "Country cannot be blank")
    private String country;

    @NotNull(message = "personality cannot be null")
    String personality;

    @NotNull(message = "Learning Styles cannot be null")
    Set<String> learningStyles;
}