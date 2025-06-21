package dev.young.backend.controller;

import dev.young.backend.dto.group.GroupDTO;
import dev.young.backend.dto.group.GroupDashboardDTO;
import dev.young.backend.dto.group.JoinGroupRequestDTO;
import dev.young.backend.dto.group.NewGroupDTO;
import dev.young.backend.service.GroupService;
import dev.young.backend.service.RecommendationService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
@Tag(name = "Group")
public class GroupController {

    private final GroupService groupService;
    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<GroupDashboardDTO> getAllGroupsData(Authentication authentication) {
        GroupDashboardDTO groupDashboardDTO = GroupDashboardDTO.builder()
                .currentGroups(groupService.getCurrentGroupsByCurrentUser(authentication))
                .currentUsersRequests(groupService.getCurrentUsersRequests(authentication))
                .othersRequests(groupService.getOthersRequests(authentication))
                .build();

        return ResponseEntity.ok(groupDashboardDTO);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDTO> getCommonGroups(@PathVariable("groupId") Long groupId,Authentication authentication) {
        return ResponseEntity.ok(groupService.getGroupById(groupId,authentication));
    }

    @GetMapping("/common/{username}")
    public ResponseEntity<List<GroupDTO>> getCommonGroups(@PathVariable String username, Authentication authentication) {
        List<GroupDTO> groupDTOS = groupService.getCommonGroups(username, authentication);

        return ResponseEntity.ok(groupDTOS);
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<JoinGroupRequestDTO> getJoinGroupRequest(@PathVariable("requestId") Long requestId) {
        return ResponseEntity.ok(groupService.getRequestById(requestId));
    }

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<GroupDTO> createGroup(@Valid @ModelAttribute NewGroupDTO newGroupDTO, @Parameter() @RequestParam(value = "icon", required = false) MultipartFile icon, Authentication authentication) {
        return ResponseEntity.ok(groupService.createGroup(newGroupDTO, icon, authentication));
    }

    @PutMapping("/edit")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void editGroup(@ModelAttribute GroupDTO groupDTO, @Parameter() @RequestParam(value = "icon", required = false) MultipartFile icon, Authentication authentication) {
        groupService.editGroup(groupDTO, icon);
    }

    @PatchMapping("/join/{groupId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseEntity<JoinGroupRequestDTO> askToJoinGroup(Authentication authentication, @PathVariable Long groupId) throws
            MessagingException, UnsupportedEncodingException {
        return ResponseEntity.ok(groupService.askToJoinGroup(authentication, groupId));
    }

    @PatchMapping("/cancel/{requestId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void cancelJoinGroup(@PathVariable Long requestId) {
        groupService.cancelJoinGroup(requestId);
    }

    @PatchMapping("/leave/{groupId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void leaveGroup(Authentication authentication, @PathVariable Long groupId) {
        groupService.leaveGroup(authentication, groupId);
    }

    @PatchMapping("/{action}/{requestId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void handleJoinGroupRequest(Authentication authentication, @PathVariable("action") String action, @PathVariable("requestId") Long requestId) throws MessagingException, UnsupportedEncodingException {
        groupService.handleJoinGroupRequest(authentication, action, requestId);
    }

    @PatchMapping("/assign-new-admin/{groupId}/{userId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void leaveGroup(Authentication authentication, @PathVariable Long
            groupId, @PathVariable UUID userId) {
        groupService.assignNewAdmin(authentication, groupId, userId);
    }
}