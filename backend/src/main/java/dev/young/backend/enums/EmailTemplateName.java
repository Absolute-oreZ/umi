package dev.young.backend.enums;

import lombok.Getter;

@Getter
public enum EmailTemplateName {
    GROUP_JOIN_REQUEST("group_join_request"),
    REQUEST_ACCEPTED("request_accepted"),
    REQUEST_REJECTED("request_rejected")
    ;

    private final String name;

    EmailTemplateName(String name){
        this.name = name;
    }
}