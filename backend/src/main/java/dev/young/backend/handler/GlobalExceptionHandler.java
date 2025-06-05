package dev.young.backend.handler;

import dev.young.backend.dto.exception.*;
import org.springframework.http.ResponseEntity;

import static dev.young.backend.enums.BusinessErrorCode.*;
import static org.springframework.http.HttpStatus.*;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashSet;
import java.util.Set;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //0, operation not permitted
    @ExceptionHandler(OperationNotPermittedException.class)
    public ResponseEntity<ExceptionResponseDTO> handleException(OperationNotPermittedException exception){
        return  ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(
                        ExceptionResponseDTO.builder()
                                .businessErrorCode(NO_CODE.getCODE())
                                .businessExceptionDescription(NO_CODE.getDESCRIPTION())
                                .error(exception.getMessage())
                                .build()
                );
    }
    //100, max no of members reached in a group
    @ExceptionHandler(MaxNoOfMemberReachedException.class)
    public ResponseEntity<ExceptionResponseDTO> handleException(MaxNoOfMemberReachedException exception){
        return  ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(
                        ExceptionResponseDTO.builder()
                                .businessErrorCode(MAX_NO_OF_MEMBERS_REACHED.getCODE())
                                .businessExceptionDescription(MAX_NO_OF_MEMBERS_REACHED.getDESCRIPTION())
                                .error(exception.getMessage())
                                .build()
                );
    }

    //101, not a group admin
    @ExceptionHandler(NotGroupAdminException.class)
    public ResponseEntity<ExceptionResponseDTO> handleException(NotGroupAdminException exception){
        return  ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(
                        ExceptionResponseDTO.builder()
                                .businessErrorCode(NOT_GROUP_ADMIN.getCODE())
                                .businessExceptionDescription(NOT_GROUP_ADMIN.getDESCRIPTION())
                                .error(exception.getMessage())
                                .build()
                );
    }
    //102, not a group member
    @ExceptionHandler(NotGroupMemberException.class)
    public ResponseEntity<ExceptionResponseDTO> handleException(NotGroupMemberException exception) {
        return ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(
                        ExceptionResponseDTO.builder()
                                .businessErrorCode(NOT_GROUP_MEMBER.getCODE())
                                .businessExceptionDescription(NOT_GROUP_MEMBER.getDESCRIPTION())
                                .error(exception.getMessage())
                                .build()
                );
    }
    // 200, validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionResponseDTO> handleException(MethodArgumentNotValidException exception) {
        Set<String> errors = new HashSet<>();
        exception.getBindingResult().getAllErrors()
                .forEach(error -> {
                    var errorMessage = error.getDefaultMessage();
                    errors.add(errorMessage);
                });

        return ResponseEntity
                .status(BAD_REQUEST)
                .body(
                        ExceptionResponseDTO.builder()
                                .businessErrorCode(VALIDATION_ERROR.getCODE())
                                .businessExceptionDescription(VALIDATION_ERROR.getDESCRIPTION())
                                .validationError(errors)
                                .build()
                );
    }

    //102, not a group member
    @ExceptionHandler(ClusterServiceException.class)
    public ResponseEntity<ExceptionResponseDTO> handleException(ClusterServiceException exception){
        return  ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(
                        ExceptionResponseDTO.builder()
                                .businessErrorCode(CLUESTER_SERVICE_NOT_AVAILABLE.getCODE())
                                .businessExceptionDescription(CLUESTER_SERVICE_NOT_AVAILABLE.getDESCRIPTION())
                                .error(exception.getMessage())
                                .build()
                );
    }

    // general error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponseDTO> handleException(Exception exception) {
        exception.printStackTrace();
        return ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(
                        ExceptionResponseDTO.builder()
                                .businessErrorCode(500)
                                .businessExceptionDescription("Unknown error occurred")
                                .error(exception.getMessage())
                                .build()
                );
    }
}