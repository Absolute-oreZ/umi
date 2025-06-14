package dev.young.backend.service;

import dev.young.backend.client.FlaskClient;
import dev.young.backend.dto.exception.ClusterServiceException;
import dev.young.backend.dto.user.LearningPreferenceDTO;
import dev.young.backend.dto.user.ProfileUpdateDTO;
import dev.young.backend.dto.user.UserDTO;
import dev.young.backend.entity.LearningPreference;
import dev.young.backend.entity.Profile;
import dev.young.backend.enums.FileType;
import dev.young.backend.mapper.LearningPreferenceMapper;
import dev.young.backend.mapper.UserMapper;
import dev.young.backend.repository.LearningPreferenceRepository;
import dev.young.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final FlaskClient flaskClient;
    private final UserMapper userMapper;
    private final LearningPreferenceMapper learningPreferenceMapper;
    private final FileService fileService;
    private final SupabaseStorageService supabaseStorageService;
    private final UserRepository userRepository;
    private final LearningPreferenceRepository learningPreferenceRepository;

    public UserDTO getProfile(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Profile user = userRepository.findById(userId).orElseThrow(() -> (new EntityNotFoundException("User not found with id " + userId)));
        return userMapper.toDTO(user);
    }

    public UserDTO getProfile(String username) {
        Profile user = userRepository.findByUsername(username).orElseThrow(() -> (new EntityNotFoundException("User not found with username " + username)));
        return userMapper.toDTO(user);
    }

    @Transactional
    public void updateProfile(@Valid ProfileUpdateDTO profileUpdateDTO, MultipartFile profilePicture, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();

        Profile user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id " + userId));

        // update Learning Preference (reuse existing if present)
        LearningPreference existingPref = user.getLearningPreference();
        LearningPreferenceDTO dto = profileUpdateDTO.getLearningPreferenceDTO();

        if (existingPref != null) {
            existingPref.setCountry(dto.getCountry());
            existingPref.setPersonality(dto.getPersonality());
            existingPref.setLearningStyles(dto.getLearningStyles());
        } else {
            LearningPreference newPref = learningPreferenceMapper.toEntity(dto);
            newPref.setUser(user);
            user.setLearningPreference(newPref);
        }

        // cluster prediction with fallback
        try {
            Integer clusterId = getClusterPrediction(dto);
            user.setClusterId(clusterId);
            user.setClusterUpdatedAt(LocalDateTime.now());
        } catch (ClusterServiceException e) {
            log.error("Cluster prediction failed, keeping previous cluster ID", e);
        }

        // update username with validation
        String newUsername = profileUpdateDTO.getUsername();
        if (!user.getUsername().equals(newUsername)) {
            if (userRepository.existsByUsername(newUsername)) {
                throw new IllegalArgumentException("Username already taken");
            }
            user.setUsername(newUsername);
        }

        // handle profile picture upload before saving user
        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                String profilePicturePath = supabaseStorageService.uploadFile(
                        profilePicture,
                        "users",
                        String.valueOf(user.getId()),
                        FileType.IMAGE
                );
                user.setProfilePicturePath(profilePicturePath);
            } catch (Exception ex) {
                log.warn("Error updating profile picture: {}", ex.getMessage());
                throw new RuntimeException("Error uploading profile picture", ex);
            }
        }

        // save updated entities (only user because cascade = ALL on learningPreference)
        userRepository.save(user);
    }


    @Transactional
    public void updateLearningPreference(@Valid LearningPreferenceDTO learningPreferenceDTO, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Profile user = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);

        LearningPreference learningPreference = user.getLearningPreference() == null ? new LearningPreference() : user.getLearningPreference();

        learningPreference.setUser(user);
        learningPreference.setCountry(learningPreferenceDTO.getCountry());
        learningPreference.setLearningStyles(learningPreferenceDTO.getLearningStyles());
        learningPreference.setPersonality(learningPreferenceDTO.getPersonality());

        try {
            Integer clusterId = getClusterPrediction(learningPreferenceDTO);
            user.setClusterId(clusterId);
            user.setClusterUpdatedAt(LocalDateTime.now());
        } catch (ClusterServiceException e) {
            log.error("Cluster prediction failed, keeping previous cluster ID", e);
        }

        learningPreferenceRepository.save(learningPreference);
    }

    public void uploadProfilePicture(MultipartFile profilePicture, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Profile user = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
//        String profilePicturePath = fileService.saveFile(profilePicture, "users", user.getId(), FileType.IMAGE);
        try {
            String profilePicturePath = supabaseStorageService.uploadFile(
                    profilePicture,
                    "users",
                    String.valueOf(user.getId()),
                    FileType.IMAGE
            );

            user.setProfilePicturePath(profilePicturePath);
            userRepository.save(user);

        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Error uploading profile picture", ex);
        }
    }

    private Integer getClusterPrediction(LearningPreferenceDTO dto) {
        if (!flaskClient.isServiceHealthy()) {
            throw new ClusterServiceException("Recommendation service unavailable");
        }

        try {
            return flaskClient.predictCluster(dto);
        } catch (RestClientException e) {
            log.error("Cluster prediction request failed", e);
            throw new ClusterServiceException("Failed to get cluster prediction: " + e.getMessage());
        }
    }
}