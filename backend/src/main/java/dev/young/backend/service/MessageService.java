package dev.young.backend.service;

import dev.young.backend.client.GeminiClient;
import dev.young.backend.dto.message.MessageDTO;
import dev.young.backend.dto.message.NewMessageDTO;
import dev.young.backend.dto.notification.NotificationDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.entity.Learner;
import dev.young.backend.entity.Message;
import dev.young.backend.enums.FileType;
import dev.young.backend.enums.MessageType;
import dev.young.backend.mapper.MessageMapper;
import dev.young.backend.repository.GroupRepository;
import dev.young.backend.repository.LearnerRepository;
import dev.young.backend.repository.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import static dev.young.backend.util.FileUtil.mapMessageTypeToFileType;

@Service
@Slf4j
@RequiredArgsConstructor
public class MessageService {

    private final GeminiClient geminiClient;
    private final FileService fileService;
    private final NotificationService notificationService;
    private final MessageMapper messageMapper;
    private final GroupRepository groupRepository;
    private final LearnerRepository learnerRepository;
    private final MessageRepository messageRepository;

    @Value("${application.bot.id}")
    private String botId;

    public MessageDTO saveMessage(NewMessageDTO newMessageDTO, MultipartFile media, Authentication connectedUser) {
        String learnerId = connectedUser.getName();
        Group group = groupRepository.findById(newMessageDTO.getGroupId()).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        Learner learner = learnerRepository.findById(learnerId).orElseThrow(() -> new EntityNotFoundException("Learner not found with id " + learnerId));
        Learner bot = learnerRepository.findById(botId).orElseThrow(() -> new EntityNotFoundException("BOT NOT FOUND"));

        Message message = Message.builder()
                .messageType(newMessageDTO.getMessageType())
                .senderProfilePicturePath(learner.getProfilePicturePath())
                .senderUsername(learner.getUsername())
                .group(group)
                .build();

        System.out.println("service here,newMessageDTO: " + newMessageDTO);
        System.out.println("service here,media: " + media);

        if (media == null) {
            message.setContent(newMessageDTO.getContent());
        } else {
            System.out.println("media is not null");
            FileType fileType = mapMessageTypeToFileType(newMessageDTO.getMessageType());

            System.out.println("filetype: " + fileType);
            if (fileType != null) {
                String mediaPath = fileService.saveFile(media, "groups", String.valueOf(group.getId()), fileType);
                message.setMediaPath(mediaPath);
            } else {
                throw new IllegalStateException("media Filetype is unknown");
            }
        }

        message.getSeenByLearners().add(learner);
        group.setLastMessage(message);
        messageRepository.save(message);

        NotificationDTO notificationDTO = NotificationDTO.builder()
                .title(group.getName())
                .content(newMessageDTO.getContent())
                .senderUsername(learner.getUsername())
                .groupId(group.getId())
                .iconPath(group.getIconPath())
                .messageDTO(messageMapper.toDTO(message))
                .build();

        notificationService.sendNotificationToGroup(notificationDTO);

        if (message.getMessageType() == MessageType.TEXT && message.getContent().startsWith("@" + bot.getUsername())) {
            log.info("Bot mentioned, handling bot response");
            handleBotMention(message, bot);
        }

        return messageMapper.toDTO(message);
    }

    public List<MessageDTO> getMessagesByGroup(Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
        return messageRepository.findMessagesByGroup(group).stream().map(messageMapper::toDTO).toList();
    }

    @Transactional
    public void markMessagesToSeen(Long groupId, Authentication connectedUser) {
        String learnerId = connectedUser.getName();
        messageRepository.markAllMessagesAsSeenNative(groupId, learnerId);
    }

    @Async
    private void handleBotMention(Message userMessage, Learner bot) {
        // Extract the actual question from the message
        String userQuestion = extractQuestionFromMessage(userMessage.getContent(), bot.getUsername());

        // Ignore if it's just a mention without a question
        if (userQuestion.trim().isEmpty()) {
            return;
        }

        try {
            log.info("Processing bot question: {}", userQuestion);

            // Get recent meaningful context (last 10 non-spam messages)
            List<Message> recentMessages = getRecentMeaningfulMessages(userMessage);

            // Build a proper prompt with context and clear instructions
            String prompt = buildBotPrompt(recentMessages, userMessage, userQuestion);

            log.info("Sending prompt to Gemini: {}", prompt);

            // Get response from Gemini
            String botResponse = geminiClient.ask(prompt);

            // Clean and format the response
            botResponse = formatBotResponse(botResponse, userMessage.getSenderUsername());

            log.info("Received response from Gemini: {}", botResponse);

            // Save bot's response
            Message botReply = Message.builder()
                    .messageType(MessageType.TEXT)
                    .group(userMessage.getGroup())
                    .senderUsername(bot.getUsername())
                    .senderProfilePicturePath(bot.getProfilePicturePath())
                    .content(botResponse)
                    .build();

            messageRepository.save(botReply);

            userMessage.getGroup().setLastMessage(botReply);
            groupRepository.save(userMessage.getGroup());

            // Send notification
            NotificationDTO notificationDTO = NotificationDTO.builder()
                    .title(userMessage.getGroup().getName())
                    .content(botResponse)
                    .senderUsername(bot.getUsername())
                    .groupId(userMessage.getGroup().getId())
                    .iconPath(userMessage.getGroup().getIconPath())
                    .messageDTO(messageMapper.toDTO(botReply))
                    .build();

            notificationService.sendNotificationToGroup(notificationDTO);

        } catch (Exception e) {
            log.error("Error in generating bot response: ", e);

            // Send error message
            Message errorReply = Message.builder()
                    .messageType(MessageType.TEXT)
                    .group(userMessage.getGroup())
                    .senderUsername(bot.getUsername())
                    .senderProfilePicturePath(bot.getProfilePicturePath())
                    .content("@" + userMessage.getSenderUsername() + " I'm sorry, I encountered an error while processing your request. Please try again.")
                    .build();

            messageRepository.save(errorReply);
        }
    }

    private String extractQuestionFromMessage(String content, String botUsername) {
        // Remove the bot mention and get the actual question
        String mention = "@" + botUsername;
        if (content.startsWith(mention)) {
            return content.substring(mention.length()).trim();
        }
        return content.trim();
    }

    private List<Message> getRecentMeaningfulMessages(Message currentMessage) {
        // Fetch messages in DESCENDING order (newest first)
        List<Message> allRecentMessages = messageRepository.findLatestMessagesByGroupExcludingCurrent(
                currentMessage.getGroup().getId(),
                currentMessage.getId(),
                PageRequest.of(0, 50)
        );

        // Process in chronological order (oldest to newest)
        return allRecentMessages.stream()
                .sorted(Comparator.comparing(Message::getCreatedDate)) // Ascending order
                .filter(this::isMeaningfulMessage)
                .collect(Collectors.toList());
    }

    private boolean isMeaningfulMessage(Message message) {
        if (message.getContent() == null) return false;

        String content = message.getContent().trim();
        if (content.isEmpty()) return false;

        // Consider bot responses as always meaningful
        if (message.getSenderUsername().equals(botId)) return true;

        // Ignore single words without context
        if (content.split("\\s+").length < 2 && !content.contains("@")) {
            return false;
        }

        // Keep messages with mentions
        if (content.contains("@")) return true;

        // Keep questions
        if (content.endsWith("?")) return true;

        // Ignore very short messages
        return content.length() > 5;
    }

    private boolean isCommonSpam(String content) {
        // Define common spam patterns - be more specific
        String[] spamPatterns = {
                "^(ha){3,}$", // hahahaha
                "^(lo){3,}l*$", // lololol
                "^(test|testing)$",
                "^(.)$", // Single characters
                "^(yes|no|ok|okay)$" // You might want to keep these, depending on context
        };

        for (String pattern : spamPatterns) {
            if (content.matches(pattern)) {
                return true;
            }
        }
        return false;
    }

    private String buildBotPrompt(List<Message> recentMessages, Message currentMessage, String userQuestion) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are 'BOT' in group '")
                .append(currentMessage.getGroup().getName())
                .append("'. Respond concisely (max 150 words). ")
                .append("Current conversation:\n");

        recentMessages.forEach(msg -> {
            String prefix = msg.getSenderUsername().equals(botId)
                    ? "[BOT] " : "[" + msg.getSenderUsername() + "] ";
            prompt.append(prefix).append(msg.getContent()).append("\n");
        });

        prompt.append("\n[CURRENT] ")
                .append(currentMessage.getSenderUsername())
                .append(": ")
                .append(userQuestion)
                .append("\n\nAnswer concisely and mention @")
                .append(currentMessage.getSenderUsername());

        return prompt.toString();
    }

    private String formatBotResponse(String response, String username) {
        if (response == null || response.trim().isEmpty()) {
            return "@" + username + " I'm sorry, I couldn't generate a proper response. Could you please rephrase your question?";
        }

        // Clean up the response
        response = response.trim();

        // Remove any unwanted formatting or metadata that Gemini might include
        if (response.startsWith("**") && response.contains("**")) {
            // Remove markdown bold formatting if present
            response = response.replaceAll("\\*\\*", "");
        }

        // Ensure the response starts with @ mention
        if (!response.startsWith("@" + username)) {
            response = "@" + username + " " + response;
        }

        // Limit response length to avoid overly long messages
        if (response.length() > 1000) {
            response = response.substring(0, 997) + "...";
        }

        return response;
    }
}