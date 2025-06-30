package dev.young.backend.mapper;

import dev.young.backend.dto.event.EventDTO;
import dev.young.backend.dto.event.NewEventDTO;
import dev.young.backend.entity.Event;
import dev.young.backend.entity.Group;
import dev.young.backend.repository.GroupRepository;
import jakarta.persistence.EntityNotFoundException;
import org.mapstruct.*;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface EventMapper {

    @Mapping(source = "groupId", target = "group", qualifiedByName = "mapGroupIdToGroup")
    Event toEntity(NewEventDTO dto, @Context GroupRepository groupRepository);

    @Mapping(source = "group.id", target = "groupId")
    EventDTO toDTO(Event event, @Context String eventCreatorUsername);

    @AfterMapping
    default void setRemindAt(@MappingTarget Event event, NewEventDTO dto) {
        if (dto.isRemindMembers() && dto.getRemindBeforeInMinutes() > 0 && event.getStartDate() != null) {
            event.setRemindAt(event.getStartDate().minusMinutes(dto.getRemindBeforeInMinutes()));
        }
    }

    @AfterMapping
    default void setEventCreatorUsername(@MappingTarget EventDTO dto, Event event, @Context String eventCreatorUsername) {
        dto.setEventCreatorUsername(eventCreatorUsername);
    }
    @AfterMapping
    default void setStatus(@MappingTarget EventDTO dto, Event event) {
        LocalDateTime now = LocalDateTime.now();
        String status = now.isBefore(event.getStartDate()) ? "upcoming" : (now.isBefore(event.getEndDate()) ? "ongoing" : "ended");
        dto.setStatus(status);
    }

    @Named("mapGroupIdToGroup")
    default Group mapGroupIdToGroup(Long groupId, @Context GroupRepository groupRepository) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
    }
}