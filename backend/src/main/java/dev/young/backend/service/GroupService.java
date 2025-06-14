package dev.young.backend.service;

import dev.young.backend.dto.exception.MaxNoOfMemberReachedException;
import dev.young.backend.dto.exception.NotGroupAdminException;
import dev.young.backend.dto.exception.NotGroupMemberException;
import dev.young.backend.dto.exception.OperationNotPermittedException;
import dev.young.backend.dto.group.GroupDTO;
import dev.young.backend.dto.group.JoinGroupRequestDTO;
import dev.young.backend.dto.group.NewGroupDTO;
import dev.young.backend.dto.message.NotificationDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.entity.Profile;
import dev.young.backend.entity.UserGroup;
import dev.young.backend.entity.Message;
import dev.young.backend.enums.*;
import dev.young.backend.mapper.GroupMapper;
import dev.young.backend.repository.GroupRepository;
import dev.young.backend.repository.UserGroupRepository;
import dev.young.backend.repository.UserRepository;
import dev.young.backend.repository.MessageRepository;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    @Value("${frontend.url}")
    private String frontendUrl;
    @Value("${frontend.paths.groups}")
    private String groupsUrl;
    @Value("${application.bot.id}")
    private String botId;

    private final GroupMapper groupMapper;
    private final SupabaseStorageService supabaseStorageService;
    private final FileService fileService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final MessageRepository messageRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final UserGroupRepository userGroupRepository;

    public List<GroupDTO> getCurrentGroupsByCurrentUser(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id " + userId);
        }

        return userGroupRepository.findCurrentGroupsByUser(userId, MemberStatus.MEMBER).stream().map(g -> groupMapper.toDTO(g, String.valueOf(userId), messageRepository)).toList();
    }

    public List<JoinGroupRequestDTO> getCurrentUsersRequests(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();

        return userGroupRepository.findPendingRequestsForCurrentUser(userId, MemberStatus.PENDING);
    }

    public List<JoinGroupRequestDTO> getOthersRequests(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();

        return userGroupRepository.findPendingRequestsForGroupsAdministeredBy(userId, MemberStatus.PENDING);
    }

    public JoinGroupRequestDTO getRequestById(Long requestId) {
        UserGroup userGroup = userGroupRepository.findById(requestId).orElseThrow(() -> new EntityNotFoundException("UserGroup not found with id " + requestId));

        return JoinGroupRequestDTO.builder()
                .requestId(requestId)
                .groupName(userGroup.getGroup().getName())
                .groupIconPath(userGroup.getGroup().getIconPath())
                .requestUserUsername(userGroup.getUser().getUsername())
                .requestUserProfilePicturePath(userGroup.getUser().getProfilePicturePath())
                .build();
    }

    public GroupDTO getGroupById(Long groupId, Authentication connectionUser) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
        String userId = (String) connectionUser.getPrincipal();
        Profile user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with id " + userId));

        return groupMapper.toDTO(group, user.getUsername(), messageRepository);
    }

    public List<GroupDTO> getCommonGroups(String username, Authentication authentication) {
        UUID userBId = (UUID) authentication.getPrincipal();
        Profile userA = userRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("User not found with username " + username));
        Profile userB = userRepository.findById(userBId).orElseThrow(() -> new EntityNotFoundException("User not found with id " + userBId));

        return groupRepository.findCommonGroups(userA.getId(), userB.getId(), MemberStatus.MEMBER)
                .stream()
                .map(g -> groupMapper.toDTO(g, userA.getUsername(), messageRepository))
                .toList();
    }

    @Transactional
    public JoinGroupRequestDTO askToJoinGroup(Authentication authentication, Long groupId) throws MessagingException, UnsupportedEncodingException {
        UUID userId = (UUID) authentication.getPrincipal();

        Group group = groupRepository.findById(groupId).orElseThrow(EntityNotFoundException::new);
        Profile user = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
        Profile groupAdmin = group.getAdmin();

        UserGroup userGroup = UserGroup.builder()
                .isAdmin(false)
                .memberStatus(MemberStatus.PENDING)
                .user(user)
                .group(group)
                .build();

        userGroupRepository.save(userGroup);

        // notify the group admin that someone has requested to join your group
        NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("New Join Group Request")
                .content("Someone has requested to join your group: " + group.getName())
                .groupId(group.getId())
                .iconPath(group.getIconPath())
                .actionType(ActionType.NEW_REQUEST)
                .requestId(userGroup.getId())
                .build();

        String formattedGroupsUrl = frontendUrl + groupsUrl;

        notificationService.sendNotificationToSingleUser(String.valueOf(groupAdmin.getId()), notificationDTO);

        emailService.sendApproveJoinGroupEmail(
                groupAdmin.getEmail(),
                "Group Join Request",
                groupAdmin.getUsername(),
                group.getName(),
                formattedGroupsUrl,
                EmailTemplateName.GROUP_JOIN_REQUEST
        );


        return JoinGroupRequestDTO.builder()
                .requestId(userGroup.getId())
                .requestUserUsername(user.getUsername())
                .requestUserProfilePicturePath(user.getProfilePicturePath())
                .groupName(group.getName())
                .groupIconPath(group.getIconPath())
                .build();
    }

    @Transactional
    public GroupDTO createGroup(NewGroupDTO newGroupDTO, MultipartFile icon, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Profile user = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
        Profile bot = userRepository.findById(UUID.fromString(botId)).orElseThrow(() -> new EntityNotFoundException("Bot not found"));

        Group group = Group.builder()
                .name(newGroupDTO.getName())
                .about(newGroupDTO.getAbout())
                .dominantClusterId(user.getClusterId())
                .clusterMemberRatio(1.0)
                .build();

        if (icon != null) {
            try {
                String iconPath = supabaseStorageService.uploadFile(
                        icon,
                        "users",
                        String.valueOf(group.getId()),
                        FileType.IMAGE
                );

                group.setIconPath(iconPath);

            } catch (Exception ex) {
                ex.printStackTrace();
                throw new RuntimeException("Error uploading profile picture", ex);
            }
        }

        groupRepository.save(group);

        UserGroup userGroup = UserGroup.builder()
                .group(group)
                .user(user)
                .memberStatus(MemberStatus.MEMBER)
                .isAdmin(true)
                .build();

        userGroupRepository.save(userGroup);

        Message message = Message.builder()
                .messageType(MessageType.NOTICE)
                .senderUsername(bot.getUsername())
                .senderProfilePicturePath(bot.getProfilePicturePath())
                .group(group)
                .content(user.getUsername() + " created the group")
                .build();

        messageRepository.save(message);

        if (newGroupDTO.isIncludeBot()) {
            UserGroup botLG = UserGroup.builder()
                    .group(group)
                    .user(bot)
                    .memberStatus(MemberStatus.BOT)
                    .isAdmin(false)
                    .build();

            userGroupRepository.save(botLG);
        }

        group.setLastMessage(message);
        return groupMapper.toDTO(group, user.getUsername(), messageRepository);
    }

    @Transactional
    public void editGroup(GroupDTO groupDTO, MultipartFile icon) {
        Group group = groupRepository.findById(groupDTO.getId()).orElseThrow(EntityNotFoundException::new);
        group.setName(groupDTO.getName());
        group.setAbout(groupDTO.getAbout());

        if (icon != null) {
            String iconPath = fileService.saveFile(icon, "groups", String.valueOf(group.getId()), FileType.IMAGE);
            group.setIconPath(iconPath);
        }

        groupRepository.save(group);
    }

    @Transactional
    public void cancelJoinGroup(Long requestId) {

        UserGroup userGroup = userGroupRepository.findById(requestId).orElseThrow(EntityNotFoundException::new);

        userGroup.setMemberStatus(MemberStatus.CANCELED);

        Profile requestUser = userGroup.getUser();
        Group group = userGroup.getGroup();
        Profile groupAdmin = group.getAdmin();

        userGroupRepository.save(userGroup);

        // notify the admin that someone has canceled their request to jon the group
        NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("Request Canceled")
                .content(requestUser.getUsername() + " has canceled their request to join your group: " + userGroup.getGroup().getName())
                .groupId(group.getId())
                .iconPath(group.getIconPath())
                .actionType(ActionType.REQUEST_CANCELED)
                .requestId(userGroup.getId())
                .build();

        notificationService.sendNotificationToSingleUser(String.valueOf(groupAdmin.getId()), notificationDTO);
    }

    @Transactional
    public void handleJoinGroupRequest(Authentication authentication, String action, Long requestId) throws MessagingException, UnsupportedEncodingException {
        UUID adminId = (UUID) authentication.getPrincipal();
        UserGroup userGroup = userGroupRepository.findById(requestId).orElseThrow(() -> new EntityNotFoundException("Request not found with id " + requestId));
        Profile user = userGroup.getUser();
        Profile admin = userRepository.findById(adminId).orElseThrow(EntityNotFoundException::new);
        Group group = userGroup.getGroup();
        UserGroup adminGroup = userGroupRepository.findByUserAndGroup(admin, group).orElseThrow(EntityNotFoundException::new);

        if (!adminGroup.isAdmin()) {
            throw new NotGroupAdminException(group.getName());
        }

        if (group.getNoOfMembers() >= 5) {
            throw new MaxNoOfMemberReachedException(group.getName());
        }

        String formatedGroupUrl = frontendUrl + groupsUrl;

        NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("Request Update")
                .groupId(group.getId())
                .iconPath(group.getIconPath())
                .requestId(userGroup.getId())
                .build();

        if (action.equals("ACCEPT")) {
            userGroup.setMemberStatus(MemberStatus.MEMBER);
            Profile bot = userRepository.findById(UUID.fromString(botId)).orElseThrow(() -> new EntityNotFoundException("Bot not found"));
            Message message = Message.builder()
                    .group(group)
                    .messageType(MessageType.NOTICE)
                    .content(user.getUsername() + " joined the group")
                    .senderUsername(bot.getUsername())
                    .senderProfilePicturePath(bot.getProfilePicturePath())
                    .build();


            notificationDTO.setContent("Your request to join the group " + group.getName() + " has been accepted");
            notificationDTO.setActionType(ActionType.REQUEST_ACCEPTED);

            messageRepository.save(message);

            updateGroupCluster(group.getId());
            group.setLastMessage(message);
            groupRepository.save(group);

            emailService.sendRequestAcceptedEmail(user.getEmail(), "Join Group Request Accepted", user.getUsername(), group.getName(), formatedGroupUrl, EmailTemplateName.REQUEST_ACCEPTED);
        } else if (action.equals("REJECT")) {
            userGroup.setMemberStatus(MemberStatus.REJECTED);

            notificationDTO.setContent("Your request to join the group " + group.getName() + " has been rejected");
            notificationDTO.setActionType(ActionType.REQUEST_REJECTED);

            emailService.sendRequestRejectedEmail(user.getEmail(), "Join Group Request Update", user.getUsername(), group.getName(), formatedGroupUrl, EmailTemplateName.REQUEST_REJECTED);
        }

        userGroupRepository.save(userGroup);
        notificationService.sendNotificationToSingleUser(String.valueOf(user.getId()), notificationDTO);
    }

    public void assignNewAdmin(Authentication authentication, Long groupId, String newAdminUserId) {
        UUID adminId = (UUID) authentication.getPrincipal();
        Group group = groupRepository.findById(groupId).orElseThrow(EntityNotFoundException::new);
        Profile currentAdmin = userRepository.findById(adminId).orElseThrow(EntityNotFoundException::new);
        Profile newAdmin = userRepository.findById(newAdminUserId).orElseThrow(EntityNotFoundException::new);

        if (currentAdmin.equals(newAdmin)) {
            throw new OperationNotPermittedException("You can't assign yourself as an admin");
        }

        UserGroup currAdminUserGroup = userGroupRepository.findByUserAndGroup(currentAdmin, group).orElseThrow(EntityNotFoundException::new);
        UserGroup newAdminUserGroup = userGroupRepository.findByUserAndGroup(newAdmin, group).orElseThrow(EntityNotFoundException::new);

        if (!currAdminUserGroup.isAdmin()) {
            throw new NotGroupAdminException(group.getName());
        }

        if (userGroupRepository.existsByUserAndGroupAndMemberStatus(newAdmin, group, MemberStatus.MEMBER)) {
            throw new NotGroupMemberException(newAdmin.getUsername(), group.getName());
        }

        currAdminUserGroup.setAdmin(false);
        newAdminUserGroup.setAdmin(true);

        userGroupRepository.save(currAdminUserGroup);
        userGroupRepository.save(newAdminUserGroup);
    }

    public void leaveGroup(Authentication authentication, Long groupId) {
        UUID userId = (UUID) authentication.getPrincipal();
        Group group = groupRepository.findById(groupId).orElseThrow(EntityNotFoundException::new);
        Profile user = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);

        UserGroup userGroup = userGroupRepository.findByUserAndGroup(user, group).orElseThrow(EntityNotFoundException::new);

        if (userGroup.isAdmin() && group.getNoOfMembers() > 1) {
            throw new OperationNotPermittedException("You can't leave this group yet because you are still an admin of this group");
        }

        userGroup.setMemberStatus(MemberStatus.LEFT);

        userGroupRepository.save(userGroup);

        updateGroupCluster(groupId);
    }

    private void updateGroupCluster(Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
        List<UserGroup> activeMembers = group.getUserGroups().stream()
                .filter(lg -> lg.getMemberStatus() == MemberStatus.MEMBER)
                .toList();

        // Calculate cluster distribution
        Map<Integer, Long> clusterCounts = activeMembers.stream()
                .map(m -> m.getUser().getClusterId())
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        Function.identity(),
                        Collectors.counting()
                ));

        // Update group stats
        if (!clusterCounts.isEmpty()) {
            Map.Entry<Integer, Long> maxEntry = Collections.max(
                    clusterCounts.entrySet(),
                    Map.Entry.comparingByValue()
            );

            System.out.println("max entry: " + maxEntry);

            group.setDominantClusterId(maxEntry.getKey());
            group.setClusterMemberRatio(
                    maxEntry.getValue() / (double) activeMembers.size()
            );
        } else {
            group.setDominantClusterId(null);
            group.setClusterMemberRatio(0.0);
        }

        groupRepository.save(group);
    }

    @Scheduled(cron = "0 45 0 * * *")
    @Transactional
    public void updateGroupCluster() {
        groupRepository.findAll().forEach(group -> {
            // Get ACTIVE MEMBERS only
            List<UserGroup> activeMembers = group.getUserGroups().stream()
                    .filter(lg -> lg.getMemberStatus() == MemberStatus.MEMBER)
                    .toList();

            // Calculate cluster distribution
            Map<Integer, Long> clusterCounts = activeMembers.stream()
                    .map(m -> m.getUser().getClusterId())
                    .filter(Objects::nonNull)
                    .collect(Collectors.groupingBy(
                            Function.identity(),
                            Collectors.counting()
                    ));

            // Update group stats
            if (!clusterCounts.isEmpty()) {
                Map.Entry<Integer, Long> maxEntry = Collections.max(
                        clusterCounts.entrySet(),
                        Map.Entry.comparingByValue()
                );

                group.setDominantClusterId(maxEntry.getKey());
                group.setClusterMemberRatio(
                        maxEntry.getValue() / (double) activeMembers.size()
                );
            } else {
                group.setDominantClusterId(null);
                group.setClusterMemberRatio(0.0);
            }

            // Sync noOfMembers with active count
            groupRepository.save(group);
        });
    }

    @Scheduled(cron = "0 0 0 4 * *") // 4 AM daily
    @Transactional
    public void updateGroupPopularityStats() {
        List<MemberStatus> activeStatuses = Arrays.asList(
                MemberStatus.PENDING,
                MemberStatus.MEMBER,
                MemberStatus.LEFT,
                MemberStatus.CANCELED,
                MemberStatus.REJECTED
        );

        groupRepository.findAll().forEach(group -> {
            long interactionCount = group.getUserGroups().stream()
                    .filter(lg -> activeStatuses.contains(lg.getMemberStatus()))
                    .count();

            group.setPopularityScore(interactionCount);
            groupRepository.save(group);
        });
    }
}