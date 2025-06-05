package dev.young.backend.dto.group;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinGroupRequestDTO {
    Long requestId;
    String requestLearnerUsername;
    String groupName;
}