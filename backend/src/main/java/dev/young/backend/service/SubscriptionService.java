package dev.young.backend.service;

import dev.young.backend.dto.user.SubscriptionDTO;
import dev.young.backend.entity.User;
import dev.young.backend.mapper.SubscriptionMapper;
import dev.young.backend.repository.SubscriptionRepository;
import dev.young.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionMapper subscriptionMapper;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionDTO getSubscription(Authentication authentication){
        UUID userId = (UUID) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with id " + userId));

        return subscriptionMapper.toDTO(user.getSubscription());
    }
}