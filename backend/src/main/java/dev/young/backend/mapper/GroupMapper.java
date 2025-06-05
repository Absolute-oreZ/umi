package dev.young.backend.mapper;

import dev.young.backend.dto.group.GroupDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.repository.MessageRepository;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {MessageMapper.class, LearnerMapper.class})
public interface GroupMapper {

    @Mapping(target = "members", source = "members")
    @Mapping(target = "noOfOnlineMembers", source = "group", qualifiedByName = "mapNoOfOnlineMembers")
    @Mapping(target = "noOfUnreadMessages", source = "group", qualifiedByName = "mapNoOfUnreadMessages")
    GroupDTO toDTO(Group group, @Context String username, @Context MessageRepository messageRepository);

    @Named("mapNoOfOnlineMembers")
    default int mapNoOfOnlineMembers(Group group) {
        return (int) group.getLearnerGroups().stream()
                .filter(lg -> lg.getLearner().isOnline())
                .count();
    }

    @Named("mapNoOfUnreadMessages")
    default int mapNoOfUnreadMessages(Group group, @Context String username, @Context MessageRepository messageRepository) {
        return messageRepository.countUnseenMessagesByGroupIdAndUsername(group.getId(), username);
    }
}