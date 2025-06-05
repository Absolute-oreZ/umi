package dev.young.backend.dto.group;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GroupDashboardDTO {
    List<GroupDTO> currentGroups;
    List<GroupDTO> recommendedGroups;
    List<JoinGroupRequestDTO> othersRequests;
    List<JoinGroupRequestDTO> currentLearnersRequests;
}