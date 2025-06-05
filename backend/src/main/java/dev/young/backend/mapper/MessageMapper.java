package dev.young.backend.mapper;

import dev.young.backend.dto.message.MessageDTO;
import dev.young.backend.entity.Message;
import dev.young.backend.enums.MessageStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "groupName", source = "group.name")
    @Mapping(target = "messageStatus", source = "message", qualifiedByName = "mapMessageStatus")
    MessageDTO toDTO(Message message);

    @Named("mapMessageStatus")
    default MessageStatus mapMessageStatus(Message message){
        return message.isMessageFullySeen() ? MessageStatus.SEEN : MessageStatus.SENT;
    }
}