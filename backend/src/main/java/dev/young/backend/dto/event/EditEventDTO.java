package dev.young.backend.dto.event;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EditEventDTO {
    @NotNull(message = "Event id cannot be null")
    private Long eventId;
    private String title;
    private String eventLink;
    private boolean notifyChanges;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}