package dev.young.backend.service;

import dev.young.backend.dto.group.GroupDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.entity.Learner;
import dev.young.backend.enums.MemberStatus;
import dev.young.backend.mapper.GroupMapper;
import dev.young.backend.repository.GroupRepository;
import dev.young.backend.repository.LearnerGroupRepository;
import dev.young.backend.repository.LearnerRepository;
import dev.young.backend.repository.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final GroupMapper groupMapper;
    private final GroupRepository groupRepository;
    private final LearnerRepository learnerRepository;
    private final MessageRepository messageRepository;
    private final LearnerGroupRepository learnerGroupRepository;

    @Cacheable(value = "recommendations", key = "#learnerId")
    public List<GroupDTO> getRecommendedGroups(Authentication connectedUser) {
        String learnerId = connectedUser.getName();
        try {
            Learner learner = learnerRepository.findById(learnerId)
                    .orElseThrow(() -> new EntityNotFoundException("Learner not found"));

            if (learner.getClusterId() == null) {
                log.warn("Learner {} has no cluster ID", learnerId);
                return Collections.emptyList();
            }

            return groupRepository.findRecommendations(learner.getClusterId(),MemberStatus.MEMBER).stream()
                    .filter(g -> meetsRecommendationCriteria(g, learner))
                    .map(g -> groupMapper.toDTO(g, learner.getUsername(), messageRepository))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to get recommendations", e);
            return fallbackRecommendations();
        }
    }

    private boolean meetsRecommendationCriteria(Group group, Learner learner) {
        return group.getDominantClusterId() != null &&
                !learnerGroupRepository.existsByLearnerAndGroupAndMemberStatus(learner, group, MemberStatus.MEMBER);
    }

    private List<GroupDTO> fallbackRecommendations() {
        return groupRepository.findPopularGroups().stream()
                .map(g -> groupMapper.toDTO(g, null, messageRepository))
                .collect(Collectors.toList());
    }
}