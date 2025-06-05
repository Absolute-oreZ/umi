package dev.young.backend.dto.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.Map;
import java.util.Set;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ExceptionResponseDTO {

    private Integer businessErrorCode;
    private String businessExceptionDescription;
    private String error;
    private Set<String> validationError;
    private Map<String,String> errors;
}