package dev.young.backend.enums;

import lombok.Getter;

@Getter
public enum EmailTemplateName {
    GROUP_JOIN_REQUEST("group_join_request"),
    REQUEST_ACCEPTED("request_accepted"),
    REQUEST_REJECTED("request_rejected"),
    NEW_EVENT("new_event"),
    EVENT_CHANGED("event_changed"),
    EVENT_CANCELLED("event_canceled"),
    ;

    private final String name;

    EmailTemplateName(String name){
        this.name = name;
    }
}