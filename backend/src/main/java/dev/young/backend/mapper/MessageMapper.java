package dev.young.backend.mapper;

import dev.young.backend.dto.message.MessageDTO;
import dev.young.backend.entity.Message;
import dev.young.backend.enums.MessageStatus;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "groupName", source = "group.name")
    @Mapping(target = "messageStatus", source = "message", qualifiedByName = "mapMessageStatus")
    MessageDTO toDTO(Message message, @Context String senderProfilePicturePath);

    @Named("mapMessageStatus")
    default MessageStatus mapMessageStatus(Message message){
        return message.isMessageFullySeen() ? MessageStatus.SEEN : MessageStatus.SENT;
    }

    @AfterMapping
    default void setSenderProfilePicturePath(@MappingTarget MessageDTO dto, Message message, @Context String senderProfilePicturePath) {
        dto.setSenderProfilePicturePath(senderProfilePicturePath);
    }
}