package dev.young.backend.enums;

import lombok.Getter;

@Getter
public enum MessageStatus {
    SENT("sent"),
    SEEN("seen");

    private final String name;

    MessageStatus(String name) {
        this.name = name;
    }
}