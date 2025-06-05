package dev.young.backend.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

public enum BusinessErrorCode {

    NO_CODE(0,NOT_IMPLEMENTED,"No Code"),
    MAX_NO_OF_MEMBERS_REACHED(100,INTERNAL_SERVER_ERROR,"The maximum no of members has been reach for this group"),
    NOT_GROUP_ADMIN(101,INTERNAL_SERVER_ERROR,"Current learner is not the admin of the group"),
    NOT_GROUP_MEMBER(102,INTERNAL_SERVER_ERROR,"Current learner is not a member of the group"),
    VALIDATION_ERROR(200,BAD_REQUEST,"Some of the fields are invalid"),
    CLUESTER_SERVICE_NOT_AVAILABLE(300,INTERNAL_SERVER_ERROR,"The recommendation service is not available right now")
    ;

    @Getter
    private final int CODE;
    @Getter
    private final String DESCRIPTION;
    @Getter
    private final HttpStatus HTTPSTATUS;

    BusinessErrorCode(int code, HttpStatus httpstatus,String description) {
        this.CODE = code;
        this.HTTPSTATUS = httpstatus;
        this.DESCRIPTION = description;
    }
}