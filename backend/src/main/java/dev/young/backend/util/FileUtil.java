package dev.young.backend.util;

import dev.young.backend.enums.FileType;
import dev.young.backend.enums.MessageType;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import static dev.young.backend.enums.FileType.*;

@Slf4j
public class FileUtil {

    private static final Map<String, FileType> EXTENSION_MAP = new HashMap<>();

    static {
        // Add image extensions
        EXTENSION_MAP.put("jpg", IMAGE);
        EXTENSION_MAP.put("jpeg", IMAGE);
        EXTENSION_MAP.put("png", IMAGE);
        EXTENSION_MAP.put("gif", IMAGE);
        EXTENSION_MAP.put("bmp", IMAGE);

        // Video extensions
        EXTENSION_MAP.put("mp4", VIDEO);
        EXTENSION_MAP.put("avi", VIDEO);
        EXTENSION_MAP.put("mov", VIDEO);
        EXTENSION_MAP.put("mkv", VIDEO);

        // Audio extensions
        EXTENSION_MAP.put("mp3", AUDIO);
        EXTENSION_MAP.put("wav", AUDIO);
        EXTENSION_MAP.put("aac", AUDIO);

        // Document extensions
        EXTENSION_MAP.put("docx", DOCX);

        // PDF
        EXTENSION_MAP.put("pdf", PDF);
    }

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

    public static FileType mapMessageTypeToFileType(MessageType messageType) {
        return switch (messageType) {
            case IMAGE -> IMAGE;
            case AUDIO -> AUDIO;
            case PDF -> PDF;
            case TEXT, DOCX -> DOCX;
            default -> null;
        };
    }

    public static FileType mapStringCategoryToFileType(String category) {
        return switch (category) {
            case "image" -> IMAGE;
            case "docs" -> DOCX;
            case "pdf" -> PDF;
            default -> null;
        };
    }

    public static String getFileExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return ""; // or throw exception if filename is mandatory
        }
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return ""; // no extension found
        }
        return originalFilename.substring(lastDotIndex + 1).toLowerCase();
    }

    public static String getOriginalNameWithoutExtension(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) return "file";
        int dot = filename.lastIndexOf(".");
        String fileName = dot == -1 ? filename : filename.substring(0, dot);
        return fileName.toLowerCase().replaceAll("\\s+", "_");
    }

    public static FileType mapFileTypeFromExtension(MultipartFile file) {
        String extension = getFileExtension(file);

        return EXTENSION_MAP.get(extension.toLowerCase());
    }
}