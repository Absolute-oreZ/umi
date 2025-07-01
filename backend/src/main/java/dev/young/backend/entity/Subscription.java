package dev.young.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@ToString
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "_subscription")
public class Subscription extends BaseEntity {
    @Column(unique = true)
    private String stripeSubscriptionId;

    @Column(nullable = false)
    private String plan;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String tier;

    @Column(nullable = false)
    private String status;

    private Long currentPeriodStart;
    private Long currentPeriodEnd;
}