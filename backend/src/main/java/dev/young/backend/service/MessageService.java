package dev.young.backend.service;

import dev.young.backend.dto.message.MessageDTO;
import dev.young.backend.dto.message.NewMessageDTO;
import dev.young.backend.dto.message.NotificationDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.entity.Message;
import dev.young.backend.entity.Profile;
import dev.young.backend.enums.FileType;
import dev.young.backend.enums.MessageType;
import dev.young.backend.mapper.MessageMapper;
import dev.young.backend.repository.GroupRepository;
import dev.young.backend.repository.MessageRepository;
import dev.young.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

import static dev.young.backend.util.FileUtil.mapMessageTypeToFileType;

@Service
@Slf4j
@RequiredArgsConstructor
public class MessageService {

    @Value("${application.bot.id}")
    private String botId;

    private final BotService botService;
    private final SupabaseStorageService supabaseStorageService;
    private final FileService fileService;
    private final NotificationService notificationService;
    private final MessageMapper messageMapper;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public MessageDTO saveMessage(NewMessageDTO newMessageDTO, MultipartFile media, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Group group = groupRepository.findById(newMessageDTO.getGroupId()).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        Profile user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with id " + userId));
        Profile bot = userRepository.findById(UUID.fromString(botId)).orElseThrow(() -> new EntityNotFoundException("BOT NOT FOUND"));

        Message message = Message.builder()
                .messageType(newMessageDTO.getMessageType())
                .senderUsername(user.getUsername())
                .group(group)
                .build();

        if (media == null) {
            message.setContent(newMessageDTO.getContent());
        } else {
            FileType fileType = mapMessageTypeToFileType(newMessageDTO.getMessageType());
            if (fileType != null) {
                String mediaPath = supabaseStorageService.uploadFile(
                        media,
                        "groups",
                        String.valueOf(group.getId()),
                        fileType
                );
                message.setMediaPath(mediaPath);
            } else {
                throw new IllegalStateException("media Filetype is unknown");
            }
        }

        message.getSeenByUsers().add(user);
        group.setLastMessage(message);
        messageRepository.save(message);

        String notificationContent = media == null ? newMessageDTO.getContent() : media.getOriginalFilename();

        NotificationDTO notificationDTO = NotificationDTO.builder()
                .title(group.getName())
                .content(notificationContent)
                .senderUsername(user.getUsername())
                .groupId(group.getId())
                .iconPath(group.getIconPath())
                .messageDTO(messageMapper.toDTO(message,user.getProfilePicturePath()))
                .build();

        notificationService.sendNotificationToGroup(notificationDTO);

        if (message.getMessageType() == MessageType.TEXT && message.getContent().startsWith("@" + bot.getUsername())) {
            log.info("Bot mentioned, handling bot response");
            botService.handleBotMention(message, bot);
        }

        return messageMapper.toDTO(message, user.getProfilePicturePath());
    }

    public List<MessageDTO> getMessagesByGroup(Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
        return messageRepository.findMessagesByGroup(group).stream().map(m -> {
            Profile sender = userRepository.findById(UUID.fromString(m.getCreatedBy())).orElseThrow(() -> new EntityNotFoundException("Sender not found"));
            return messageMapper.toDTO(m, sender.getProfilePicturePath());
        }).toList();
    }

    @Transactional
    public void markMessagesToSeen(Long groupId, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        messageRepository.markAllMessagesAsSeenNative(groupId, userId);
    }
}