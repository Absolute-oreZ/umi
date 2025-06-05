package dev.young.backend.service;

import dev.young.backend.dto.notification.NotificationDTO;
import dev.young.backend.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final GroupRepository groupRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public void sendNotificationToGroup(NotificationDTO notificationDTO) {
        String destination = "/topic/group/" + notificationDTO.getGroupId();
        simpMessagingTemplate.convertAndSend(destination, notificationDTO);
    }

    public void sendNotificationToSingleLearner(String learnerId, NotificationDTO notificationDTO) {
        simpMessagingTemplate.convertAndSendToUser(
                learnerId,
                "/notification",
                notificationDTO
        );
    }
}