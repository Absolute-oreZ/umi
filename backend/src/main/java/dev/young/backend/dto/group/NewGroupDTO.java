package dev.young.backend.dto.group;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NewGroupDTO {
    @NotBlank(message = "Group name cannot be blank")
    private String name;
    @NotBlank(message = "Group about cannot be blank")
    private String about;
    boolean includeBot;
}