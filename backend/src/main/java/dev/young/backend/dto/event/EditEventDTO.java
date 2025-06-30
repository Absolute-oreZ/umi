package dev.young.backend.dto.event;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EditEventDTO {
    private String title;
    private String eventLink;
    private boolean notifyChanges;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}