package dev.young.backend.service;

import dev.young.backend.client.GeminiClient;
import dev.young.backend.dto.notification.NotificationDTO;
import dev.young.backend.entity.Learner;
import dev.young.backend.entity.Message;
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

    @Value("${application.bot.id}")
    private String botId;

    private final GeminiClient geminiClient;
    private final MessageMapper messageMapper;
    private final GroupRepository groupRepository;
    private final MessageRepository messageRepository;
    private final NotificationService notificationService;

    @Async
    public void handleBotMention(Message userMessage, Learner bot) {
        // Extract the actual question from the message
        String userQuestion = extractQuestionFromMessage(userMessage.getContent(), bot.getUsername());

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

            // GeminiClient.ask() returns Mono<String>, so we block for the result in async thread
            String botResponse = geminiClient.ask(prompt).block();

            botResponse = formatBotResponse(botResponse, userMessage.getSenderUsername());

            log.info("Received response from Gemini: {}", botResponse);

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