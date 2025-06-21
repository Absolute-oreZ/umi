package dev.young.backend.dto.event;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeleteEventDTO {
    @NotNull(message = "Event id cannot be null")
    private Long eventId;
    private boolean notifyDeletion;
}