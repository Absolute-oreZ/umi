package dev.young.backend.enums;

import lombok.Getter;

@Getter
public enum MemberStatus {
    CANCELED("canceled"),
    PENDING("pending"),
    MEMBER("member"),
    REJECTED("rejected"),
    LEFT("left"),
    BOT("bot");

    private final String name;

    MemberStatus(String name) {
        this.name = name;
    }
}