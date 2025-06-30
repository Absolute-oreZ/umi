package dev.young.backend.service;

import dev.young.backend.client.GeminiClient;
import dev.young.backend.dto.message.NotificationDTO;
import dev.young.backend.entity.Message;
import dev.young.backend.entity.User;
import dev.young.backend.enums.MessageType;
import dev.young.backend.mapper.MessageMapper;
import dev.young.backend.repository.GroupRepository;
import dev.young.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class BotService {

    @Value("${application.bot.username}")
    private String botUsername;

    private final GeminiClient geminiClient;
    private final MessageMapper messageMapper;
    private final GroupRepository groupRepository;
    private final MessageRepository messageRepository;
    private final NotificationService notificationService;

    @Async
    public void handleBotMention(Message userMessage, User bot) {
        // extract the actual question from the message
        String userQuestion = extractQuestionFromMessage(userMessage.getContent(), bot.getUsername());

        if (userQuestion.trim().isEmpty()) {
            return;
        }

        try {
            log.info("Processing bot question: {}", userQuestion);
            List<Message> recentMessages = getRecentMeaningfulMessages(userMessage);

            String prompt = buildBotPrompt(recentMessages, userMessage, userQuestion);

            log.info("Sending prompt to Gemini: {}", prompt);

            // GeminiClient.ask() returns Mono<String>, so we block for the result in async thread
            String botResponse = geminiClient.ask(prompt).block();

            botResponse = formatBotResponse(botResponse, userMessage.getSenderUsername());

            log.info("Received response from Gemini: {}", botResponse);

            Message botReply = Message.builder()
                    .messageType(MessageType.TEXT)
                    .group(userMessage.getGroup())
                    .senderUsername(bot.getUsername())
                    .content(botResponse)
                    .build();

            messageRepository.save(botReply);

            userMessage.getGroup().setLastMessage(botReply);
            groupRepository.save(userMessage.getGroup());

            NotificationDTO notificationDTO = NotificationDTO.builder()
                    .title(userMessage.getGroup().getName())
                    .content(botResponse)
                    .senderUsername(bot.getUsername())
                    .groupId(userMessage.getGroup().getId())
                    .iconPath(userMessage.getGroup().getIconPath())
                    .messageDTO(messageMapper.toDTO(botReply,bot.getProfilePicturePath()))
                    .build();

            notificationService.sendNotificationToGroup(notificationDTO);

        } catch (Exception e) {
            log.error("Error in generating bot response: ", e);

            Message errorReply = Message.builder()
                    .messageType(MessageType.TEXT)
                    .group(userMessage.getGroup())
                    .senderUsername(bot.getUsername())
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
        List<Message> allRecentMessages = messageRepository.findLatestMessagesByGroupExcludingCurrent(
                currentMessage.getGroup().getId(),
                currentMessage.getId(),
                PageRequest.of(0, 100)
        );

        return allRecentMessages.stream()
                .sorted(Comparator.comparing(Message::getCreatedDate))
                .filter(this::isMeaningfulMessage)
                .limit(50)
                .collect(Collectors.toList());
    }

    private boolean isMeaningfulMessage(Message message) {
        if (message.getContent() == null) return false;

        String content = message.getContent().trim();
        if (content.isEmpty()) return false;

        if (message.getSenderUsername().equals(botUsername)) return true;

        if (content.split("\\s+").length < 2 && !content.contains("@")) {
            return false;
        }

        if(isCommonSpam(message.getContent())){
            return false;
        }

        if (content.contains("@")) return true;

        if (content.endsWith("?")) return true;

        return content.length() > 5;
    }

    private boolean isCommonSpam(String content) {
        // Define common spam patterns - be more specific
        String[] spamPatterns = {
                "^(ha){3,}$", // hahahaha
                "^(lo){3,}l*$", // lololol
                "^(test|testing)$",
                "^(.)$", // single characters
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

        prompt.append("You are 'UMI-BOT' in group '")
                .append(currentMessage.getGroup().getName())
                .append("'. Respond concisely (max 150 words). ")
                .append("Current conversation:\n");

        recentMessages.forEach(msg -> {
            String prefix = msg.getSenderUsername().equals(botUsername)
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

        // clean up the response
        response = response.trim();

        if (response.startsWith("**") && response.contains("**")) {
            // remove markdown bold formatting if present
            response = response.replaceAll("\\*\\*", "");
        }

        if (!response.startsWith("@" + username)) {
            response = "@" + username + " " + response;
        }

        // limit response length to avoid overly long messages
        if (response.length() > 1000) {
            response = response.substring(0, 997) + "...";
        }

        return response;
    }
}