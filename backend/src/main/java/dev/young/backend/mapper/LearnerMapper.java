package dev.young.backend.mapper;

import dev.young.backend.dto.learner.LearnerDTO;
import dev.young.backend.entity.Learner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {LearningPreferenceMapper.class})
public interface LearnerMapper {
    @Mapping(target = "isOnline",source = "online")
    LearnerDTO toDTO(Learner learner);

    @Named("mapIsOnline")
    default boolean mapIsOnline(Learner learner){
        return learner.isOnline();
    }
}