package dev.young.backend.controller;

import dev.young.backend.dto.user.ProfileUpdateDTO;
import dev.young.backend.dto.user.SubscriptionDTO;
import dev.young.backend.dto.user.UserDTO;
import dev.young.backend.service.SubscriptionService;
import dev.young.backend.service.UserService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User")
public class UserController {

    private final UserService userService;
    private final SubscriptionService subscriptionService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Authentication connectedUser) {
        UserDTO userDTO = userService.getProfile(connectedUser);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserDTO> getProfile(@PathVariable String username) {
        UserDTO userDTO = userService.getProfile(username);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/subscription")
    public ResponseEntity<SubscriptionDTO> getCurrentUserSubscription(
            Authentication authentication) {

        return ResponseEntity.ok(subscriptionService.getSubscription(authentication));
    }

    @PatchMapping("/update-profile")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void updateProfile(@Valid @ModelAttribute ProfileUpdateDTO profileUpdateDTO, @Parameter() @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture, Authentication authentication) {
        userService.updateProfile(profileUpdateDTO,profilePicture,authentication);
    }
}