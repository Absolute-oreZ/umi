package dev.young.backend.dto.user;

import lombok.Data;

@Data
public class SubscriptionDTO {
    private String tier;
    private String interval;
    private String status;
    private Long currentPeriodStart;
    private Long currentPeriodEn;
}