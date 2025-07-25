package dev.young.backend.mapper;

import dev.young.backend.dto.user.LearningPreferenceDTO;
import dev.young.backend.entity.LearningPreference;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LearningPreferenceMapper {
    LearningPreference toEntity(LearningPreferenceDTO learningPreferenceDTO);
}