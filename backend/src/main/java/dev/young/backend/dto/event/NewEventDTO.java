package dev.young.backend.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NewEventDTO {
    @NotBlank(message = "Event tile cannot be blank")
    private String title;
    @NotNull(message = "Group id cannot be null")
    private Long groupId;
    private String eventLink;
    private boolean notifyMembers;
    private boolean remindMembers;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer remindBeforeInMinutes;
}