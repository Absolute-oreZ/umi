package dev.young.backend.dto.user;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String profilePicturePath;
    private LocalDateTime lastSeen;
    private boolean isOnline;
    private boolean isAccountPremium;
    private LearningPreferenceDTO learningPreference;
}