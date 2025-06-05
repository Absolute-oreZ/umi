package dev.young.backend.dto.learner;

import dev.young.backend.dto.learning_preference.LearningPreferenceDTO;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class LearnerDTO {
    private String id;
    private String username;
    private String email;
    private String profilePicturePath;
    private LocalDateTime lastSeen;
    private boolean isOnline;
    private boolean isAccountPremium;
    private LearningPreferenceDTO learningPreference;
}