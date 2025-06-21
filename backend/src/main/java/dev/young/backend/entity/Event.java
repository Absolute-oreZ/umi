package dev.young.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@ToString
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Event extends BaseEntity{
    @Column(nullable = false)
    private String title;
    private String eventLink;
    private boolean notifyMembers;
    private boolean remindMembers;
    private boolean notified;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime remindAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;
}