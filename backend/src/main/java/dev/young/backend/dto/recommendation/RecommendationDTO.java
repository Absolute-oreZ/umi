package dev.young.backend.dto.recommendation;

import dev.young.backend.dto.group.GroupDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecommendationDTO {
    private GroupDTO groupDTO;
    private double score;
    private String reason;
}