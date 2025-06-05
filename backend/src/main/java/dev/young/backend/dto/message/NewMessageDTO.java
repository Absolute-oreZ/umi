package dev.young.backend.dto.message;

import dev.young.backend.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NewMessageDTO {
    private String content;
    private MessageType messageType;
    @NotNull(message = "Group Id cannot be null")
    private Long groupId;
}