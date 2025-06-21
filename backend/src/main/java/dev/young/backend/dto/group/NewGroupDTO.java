package dev.young.backend.dto.group;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NewGroupDTO {

    private String name;
    @NotBlank(message = "Group about cannot be blank")
    private String about;
    boolean includeBot;
}