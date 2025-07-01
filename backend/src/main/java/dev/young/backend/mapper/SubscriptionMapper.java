package dev.young.backend.mapper;

import dev.young.backend.dto.user.SubscriptionDTO;
import dev.young.backend.entity.Subscription;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {
    SubscriptionDTO toDTO(Subscription subscription);

    @AfterMapping
    default void setInterval(@MappingTarget SubscriptionDTO dto, Subscription sub) {
        String interval = "forever";
        if (sub.getPlan() != null && sub.getPlan().contains("_")) {
            interval = sub.getPlan().split("_")[1];
        }

        dto.setInterval(interval);
    }
}