package dev.young.backend.service;

import dev.young.backend.enums.FileType;
import jakarta.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static java.io.File.separator;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    @Value("${application.file.upload.photos-output-path}")
    private String fileUploadPath;

    public String saveFile(
            @Nonnull MultipartFile sourceFile,
            @Nonnull String rootFolder,
            @Nonnull String id,
            @Nonnull FileType fileType
    ) {
        final String FILE_UPLOAD_SUB_PATH = rootFolder + separator + id + separator + fileType.getName();
        return uploadFile(sourceFile, FILE_UPLOAD_SUB_PATH);
    }

    private String uploadFile(
            @Nonnull MultipartFile sourceFile,
            @Nonnull String fileUploadSubPath
    ) {
        final String FINAL_UPLOAD_PATH = fileUploadPath + separator + fileUploadSubPath;
        File targetFolder = new File(FINAL_UPLOAD_PATH);

        if(!targetFolder.exists()){
            boolean folderCreated = targetFolder.mkdirs();
            if(!folderCreated){
                log.warn("Failed to create the target folder");
                return null;
            }
        }

        final String FILE_EXTENSION = getFileExtension(sourceFile.getOriginalFilename());
        String originalName = originalNameWithoutExtension(sourceFile.getOriginalFilename());
        String targetFilePath = FINAL_UPLOAD_PATH + separator + originalName + "." + FILE_EXTENSION;

        Path targetPath = Paths.get(targetFilePath);

        try{
            Files.write(targetPath,sourceFile.getBytes());
            log.info("File saved to {} successfully", targetFilePath);
            return targetFilePath;
        }catch (IOException exception){
            log.error("File was not saved",exception);
        }

        return null;
    }

    private String getFileExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) {
            return "";
        }

        int lastDotIndex = originalFilename.lastIndexOf('.');

        if (lastDotIndex == -1) {
            return "";
        }

        return originalFilename.substring(lastDotIndex + 1).toLowerCase();
    }

    private String originalNameWithoutExtension(String filename) {
        if (filename == null || filename.isEmpty()) return "file";
        int dot = filename.lastIndexOf(".");
        return dot == -1 ? filename : filename.substring(0, dot);
    }
}