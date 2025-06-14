package dev.young.backend.mapper;

import dev.young.backend.dto.user.UserDTO;
import dev.young.backend.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {LearningPreferenceMapper.class})
public interface UserMapper {
    @Mapping(target = "isOnline",source = "online")
    UserDTO toDTO(Profile user);

    @Named("mapIsOnline")
    default boolean mapIsOnline(Profile user){
        return user.isOnline();
    }
}