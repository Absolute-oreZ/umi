package dev.young.backend.util;

import dev.young.backend.enums.FileType;
import dev.young.backend.enums.MessageType;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
public class FileUtil {

    public static byte[] readFileFromLocation(String fileUrl) {
        if (StringUtils.isBlank(fileUrl)) {
            return new byte[0];
        }
        try {
            Path filePath = new File(fileUrl).toPath();
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.warn("Nou file found in the path {}", fileUrl);
        }
        return new byte[0];
    }

    public static FileType mapMessageTypeToFileType(MessageType messageType){
        return switch (messageType) {
            case IMAGE -> FileType.IMAGE;
            case AUDIO -> FileType.AUDIO;
            case PDF -> FileType.PDF;
            case TEXT, DOCX -> FileType.DOCX;
            default -> null;
        };
    }
}