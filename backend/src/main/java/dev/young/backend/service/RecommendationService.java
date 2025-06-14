package dev.young.backend.service;

import dev.young.backend.dto.group.GroupDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.entity.Profile;
import dev.young.backend.enums.MemberStatus;
import dev.young.backend.mapper.GroupMapper;
import dev.young.backend.repository.GroupRepository;
import dev.young.backend.repository.MessageRepository;
import dev.young.backend.repository.UserGroupRepository;
import dev.young.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final GroupMapper groupMapper;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final UserGroupRepository userGroupRepository;

    @Cacheable(value = "recommendations", key = "#userId")
    public List<GroupDTO> getRecommendedGroups(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        try {
            Profile user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));

            if (user.getClusterId() == null) {
                log.warn("user {} has no cluster ID", userId);
                return Collections.emptyList();
            }

            return groupRepository.findRecommendations(user.getClusterId(),MemberStatus.MEMBER).stream()
                    .filter(g -> meetsRecommendationCriteria(g, user))
                    .map(g -> groupMapper.toDTO(g, user.getUsername(), messageRepository))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to get recommendations", e);
            return fallbackRecommendations();
        }
    }

    private boolean meetsRecommendationCriteria(Group group, Profile user) {
        return group.getDominantClusterId() != null &&
                !userGroupRepository.existsByUserAndGroupAndMemberStatus(user, group, MemberStatus.MEMBER);
    }

    private List<GroupDTO> fallbackRecommendations() {
        return groupRepository.findPopularGroups().stream()
                .map(g -> groupMapper.toDTO(g, null, messageRepository))
                .collect(Collectors.toList());
    }
}