package dev.young.backend.controller;

import dev.young.backend.dto.message.MessageDTO;
import dev.young.backend.dto.message.NewMessageDTO;
import dev.young.backend.service.MessageService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@Tag(name = "Message")
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<MessageDTO>> getMessagesByGroup(@PathVariable Long groupId) {
        List<MessageDTO> messageDTOs = messageService.getMessagesByGroup(groupId);

        return ResponseEntity.ok(messageDTOs);
    }

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<MessageDTO> saveMessage(@Valid @ModelAttribute NewMessageDTO newMessageDTO, @Parameter() @RequestParam(value = "media", required = false) MultipartFile media, Authentication connectedUser) {
        return ResponseEntity.ok(messageService.saveMessage(newMessageDTO, media, connectedUser));
    }

    @PatchMapping("/{groupId}/seen")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void markMessagesToSeen(@PathVariable Long groupId, Authentication connectedUser) {
        messageService.markMessagesToSeen(groupId,connectedUser);
    }

}