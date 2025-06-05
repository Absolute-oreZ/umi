package dev.young.backend.enums;

import lombok.Getter;

@Getter
public enum MessageType {
    NOTICE("notice"),
    TEXT("text"),
    IMAGE("image"),
    AUDIO("audio"),
    PDF("pdf"),
    DOCX("docx");

    private final String name;

    MessageType(String name) {
        this.name = name;
    }
}