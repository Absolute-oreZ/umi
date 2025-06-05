package dev.young.backend.enums;

import lombok.Getter;

@Getter
public enum FileType {
    IMAGE("image"),
    VIDEO("video"),
    AUDIO("audio"),
    DOCX("docx"),
    PDF("pdf");

    private final String name;

    FileType(String name) {
        this.name = name;
    }
}