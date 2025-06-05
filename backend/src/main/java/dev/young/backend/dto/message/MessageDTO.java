package dev.young.backend.dto.message;

import dev.young.backend.enums.MessageStatus;
import dev.young.backend.enums.MessageType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageDTO {
    private Long id;
    private Long groupId;
    private String groupName;
    private String content;
    private String mediaPath;
    private MessageStatus messageStatus;
    private MessageType messageType;
    private String senderUsername;
    private String senderProfilePicturePath;
    private LocalDateTime createdDate;
}