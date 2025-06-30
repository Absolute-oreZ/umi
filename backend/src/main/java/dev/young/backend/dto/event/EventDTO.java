package dev.young.backend.dto.event;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventDTO {
    private Long id;
    private Long groupId;
    private String status;
    private String title;
    private String eventLink;
    private String eventCreatorUsername;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdDate;
}