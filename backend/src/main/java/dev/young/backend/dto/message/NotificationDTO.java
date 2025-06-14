package dev.young.backend.dto.message;

import dev.young.backend.enums.ActionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationDTO {
    Long groupId;
    Long requestId;
    String title;
    String senderUsername;
    String content;
    String iconPath;
    ActionType actionType;
    MessageDTO messageDTO;
}