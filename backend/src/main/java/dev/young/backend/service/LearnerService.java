package dev.young.backend.service;

import dev.young.backend.client.FlaskClient;
import dev.young.backend.dto.exception.ClusterServiceException;
import dev.young.backend.dto.learning_preference.LearningPreferenceDTO;
import dev.young.backend.dto.learner.LearnerDTO;
import dev.young.backend.entity.LearningPreference;
import dev.young.backend.entity.Learner;
import dev.young.backend.enums.FileType;
import dev.young.backend.mapper.LearnerMapper;
import dev.young.backend.repository.LearningPreferenceRepository;
import dev.young.backend.repository.LearnerRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LearnerService {

    private final FlaskClient flaskClient;
    private final LearnerMapper learnerMapper;
    private final FileService fileService;
    private final SupabaseStorageService supabaseStorageService;
    private final LearnerRepository learnerRepository;
    private final LearningPreferenceRepository learningPreferenceRepository;
    private static final Logger log = LoggerFactory.getLogger(LearnerService.class);

    public LearnerDTO getProfile(Authentication connectedUser) {
        String learnerId = connectedUser.getName();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow(() -> (new EntityNotFoundException("User not found with id " + learnerId)));
        return learnerMapper.toDTO(learner);
    }

    public LearnerDTO getProfile(String username) {
        Learner learner = learnerRepository.findByUsername(username).orElseThrow(() -> (new EntityNotFoundException("User not found with username " + username)));
        return learnerMapper.toDTO(learner);
    }

    @Transactional
    public void updateLearningPreference(@Valid LearningPreferenceDTO learningPreferenceDTO, Authentication connectedUser) {
        String userId = connectedUser.getName();
        Learner learner = learnerRepository.findById(userId).orElseThrow(EntityNotFoundException::new);

        LearningPreference learningPreference = learner.getLearningPreference() == null ? new LearningPreference() : learner.getLearningPreference();

        learningPreference.setLearner(learner);
        learningPreference.setCountry(learningPreferenceDTO.getCountry());
        learningPreference.setLearningStyles(learningPreferenceDTO.getLearningStyles());
        learningPreference.setPersonality(learningPreferenceDTO.getPersonality());

        try {
            System.out.println("predicting cluster");
            Integer clusterId = getClusterPrediction(learningPreferenceDTO);
            learner.setClusterId(clusterId);
            System.out.println("predicted cluster: " + clusterId);
            learner.setClusterUpdatedAt(LocalDateTime.now());
        } catch (ClusterServiceException e) {
            log.error("Cluster prediction failed, keeping previous cluster ID", e);
        }

        learningPreferenceRepository.save(learningPreference);
    }

    public void uploadProfilePicture(MultipartFile profilePicture, Authentication connectedUser) {
        String userId = connectedUser.getName();
        Learner learner = learnerRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
//        String profilePicturePath = fileService.saveFile(profilePicture, "users", learner.getId(), FileType.IMAGE);
        try {
            String profilePicturePath = supabaseStorageService.uploadFile(
                    profilePicture,
                    "users",
                    learner.getId(),
                    FileType.IMAGE
            );

            learner.setProfilePicturePath(profilePicturePath);
            learnerRepository.save(learner);

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

    public void synchronizeWithIDP(Jwt token) {
        Map<String, Object> claims = token.getClaims();
        String email = (String) claims.getOrDefault("email", "");
        Optional<Learner> optLearner = learnerRepository.findByEmail(email);
        Learner learner;

        learner = optLearner.orElseGet(() -> Learner.builder()
                .email(email)
                .id((String) claims.get("sub"))
                .username((String) claims.get("preferred_username"))
                .build());

        learner.setLastSeen(LocalDateTime.now());

        learnerRepository.save(learner);
    }

}