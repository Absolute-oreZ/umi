package dev.young.backend.enums;

import lombok.Getter;

@Getter
public enum ActionType {
    REQUEST_ACCEPTED("request accepted"),
    REQUEST_REJECTED("request rejected"),
    REQUEST_CANCELED("request canceled"),
    NEW_REQUEST("new request");

    private final String name;

    ActionType(String name) {
        this.name = name;
    }
}