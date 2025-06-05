package dev.young.backend.service;

import dev.young.backend.dto.exception.MaxNoOfMemberReachedException;
import dev.young.backend.dto.exception.NotGroupAdminException;
import dev.young.backend.dto.exception.NotGroupMemberException;
import dev.young.backend.dto.exception.OperationNotPermittedException;
import dev.young.backend.dto.group.GroupDTO;
import dev.young.backend.dto.group.JoinGroupRequestDTO;
import dev.young.backend.dto.group.NewGroupDTO;
import dev.young.backend.dto.notification.NotificationDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.entity.Learner;
import dev.young.backend.entity.LearnerGroup;
import dev.young.backend.entity.Message;
import dev.young.backend.enums.*;
import dev.young.backend.mapper.GroupMapper;
import dev.young.backend.repository.GroupRepository;
import dev.young.backend.repository.LearnerGroupRepository;
import dev.young.backend.repository.LearnerRepository;
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
    private final FileService fileService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final MessageRepository messageRepository;
    private final GroupRepository groupRepository;
    private final LearnerRepository learnerRepository;
    private final LearnerGroupRepository learnerGroupRepository;

    public List<GroupDTO> getCurrentGroupsByCurrentLearner(Authentication connectedUser) {
        String learnerId = connectedUser.getName();
        if (!learnerRepository.existsById(learnerId)) {
            throw new EntityNotFoundException("learner not found with id " + learnerId);
        }

        return learnerGroupRepository.findCurrentGroupsByLearner(learnerId, MemberStatus.MEMBER).stream().map(g -> groupMapper.toDTO(g, learnerId, messageRepository)).toList();
    }

    public List<JoinGroupRequestDTO> getCurrentLearnersRequests(Authentication connectedUser) {
        String learnerId = connectedUser.getName();

        return learnerGroupRepository.findPendingRequestsForCurrentLearner(learnerId, MemberStatus.PENDING);
    }

    public List<JoinGroupRequestDTO> getOthersRequests(Authentication connectedUser) {
        String learnerId = connectedUser.getName();

        return learnerGroupRepository.findPendingRequestsForGroupsAdministeredBy(learnerId, MemberStatus.PENDING);
    }

    public JoinGroupRequestDTO getRequestById(Long requestId) {
        LearnerGroup learnerGroup = learnerGroupRepository.findById(requestId).orElseThrow(() -> new EntityNotFoundException("LearnerGroup not found with id " + requestId));

        return JoinGroupRequestDTO.builder()
                .requestId(requestId)
                .groupName(learnerGroup.getGroup().getName())
                .requestLearnerUsername(learnerGroup.getLearner().getUsername())
                .build();
    }

    public GroupDTO getGroupById(Long groupId, Authentication connectionUser) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
        String learnerId = connectionUser.getName();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow(() -> new EntityNotFoundException("Learner not found with id " + learnerId));

        return groupMapper.toDTO(group, learner.getUsername(), messageRepository);
    }

    @Transactional
    public JoinGroupRequestDTO askToJoinGroup(Authentication connectedUser, Long groupId) throws MessagingException, UnsupportedEncodingException {
        String learnerId = connectedUser.getName();

        Group group = groupRepository.findById(groupId).orElseThrow(EntityNotFoundException::new);
        Learner learner = learnerRepository.findById(learnerId).orElseThrow(EntityNotFoundException::new);
        Learner groupAdmin = group.getAdmin();

        LearnerGroup learnerGroup = LearnerGroup.builder()
                .isAdmin(false)
                .memberStatus(MemberStatus.PENDING)
                .learner(learner)
                .group(group)
                .build();

        learnerGroupRepository.save(learnerGroup);

        // notify the group admin that someone has requested to join your group
        NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("New Join Group Request")
                .content("Someone has requested to join your group: " + group.getName())
                .groupId(group.getId())
                .iconPath(group.getIconPath())
                .actionType(ActionType.NEW_REQUEST)
                .requestId(learnerGroup.getId())
                .build();

        String formattedGroupsUrl = frontendUrl + groupsUrl;

        notificationService.sendNotificationToSingleLearner(groupAdmin.getId(), notificationDTO);

        emailService.sendApproveJoinGroupEmail(
                groupAdmin.getEmail(),
                "Group Join Request",
                groupAdmin.getUsername(),
                group.getName(),
                formattedGroupsUrl,
                EmailTemplateName.GROUP_JOIN_REQUEST
        );


        return JoinGroupRequestDTO.builder()
                .requestId(learnerGroup.getId())
                .requestLearnerUsername(learner.getUsername())
                .groupName(group.getName())
                .build();
    }


    @Transactional
    public GroupDTO createGroup(NewGroupDTO newGroupDTO, MultipartFile icon, Authentication connectedUser) {

        Group group = Group.builder()
                .name(newGroupDTO.getName())
                .about(newGroupDTO.getAbout())
                .build();

        if (icon != null) {
            String iconPath = fileService.saveFile(icon, "groups", String.valueOf(group.getId()), FileType.IMAGE);
            group.setIconPath(iconPath);
            groupRepository.save(group);
        }

        String learnerId = connectedUser.getName();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow(EntityNotFoundException::new);
        Learner bot = learnerRepository.findById(botId).orElseThrow(() -> new EntityNotFoundException("Bot not found"));

        LearnerGroup learnerGroup = LearnerGroup.builder()
                .group(group)
                .learner(learner)
                .memberStatus(MemberStatus.MEMBER)
                .isAdmin(true)
                .build();

        learnerGroupRepository.save(learnerGroup);

        if (newGroupDTO.isIncludeBot()) {
            LearnerGroup botLG = LearnerGroup.builder()
                    .group(group)
                    .learner(bot)
                    .memberStatus(MemberStatus.BOT)
                    .isAdmin(false)
                    .build();

            learnerGroupRepository.save(botLG);
        }

        Message message = Message.builder()
                .messageType(MessageType.NOTICE)
                .senderUsername(bot.getUsername())
                .senderProfilePicturePath(bot.getProfilePicturePath())
                .group(group)
                .content(learner.getUsername() + " created the group")
                .build();

        messageRepository.save(message);

        group.setLastMessage(message);

        updateGroupCluster(group);
        groupRepository.save(group);
        return groupMapper.toDTO(group, learner.getUsername(), messageRepository);
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

        LearnerGroup learnerGroup = learnerGroupRepository.findById(requestId).orElseThrow(EntityNotFoundException::new);

        learnerGroup.setMemberStatus(MemberStatus.CANCELED);

        Learner requestLearner = learnerGroup.getLearner();
        Group group = learnerGroup.getGroup();
        Learner groupAdmin = group.getAdmin();

        learnerGroupRepository.save(learnerGroup);

        // notify the admin that someone has canceled their request to jon the group
        NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("Request Canceled")
                .content(requestLearner.getUsername() + " has canceled their request to join your group: " + learnerGroup.getGroup().getName())
                .groupId(group.getId())
                .iconPath(group.getIconPath())
                .actionType(ActionType.REQUEST_CANCELED)
                .requestId(learnerGroup.getId())
                .build();

        notificationService.sendNotificationToSingleLearner(groupAdmin.getId(), notificationDTO);
    }

    @Transactional
    public void handleJoinGroupRequest(Authentication connectedUser, String action, Long requestId) throws MessagingException, UnsupportedEncodingException {
        String adminId = connectedUser.getName();
        LearnerGroup learnerGroup = learnerGroupRepository.findById(requestId).orElseThrow(() -> new EntityNotFoundException("Request not found with id " + requestId));
        Learner learner = learnerGroup.getLearner();
        Learner admin = learnerRepository.findById(adminId).orElseThrow(EntityNotFoundException::new);
        Group group = learnerGroup.getGroup();
        LearnerGroup adminGroup = learnerGroupRepository.findByLearnerAndGroup(admin, group).orElseThrow(EntityNotFoundException::new);

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
                .requestId(learnerGroup.getId())
                .build();

        if (action.equals("ACCEPT")) {
            learnerGroup.setMemberStatus(MemberStatus.MEMBER);

            Learner bot = learnerRepository.findById(botId).orElseThrow(() -> new EntityNotFoundException("Bot not found"));
            Message message = Message.builder()
                    .group(group)
                    .messageType(MessageType.NOTICE)
                    .content(learner.getUsername() + " joined the group")
                    .senderUsername(bot.getUsername())
                    .senderProfilePicturePath(bot.getProfilePicturePath())
                    .build();


            notificationDTO.setContent("Your request to join the group " + group.getName() + " has been accepted");
            notificationDTO.setActionType(ActionType.REQUEST_ACCEPTED);

            messageRepository.save(message);

            updateGroupCluster(group);
            group.setLastMessage(message);
            groupRepository.save(group);

            emailService.sendRequestAcceptedEmail(learner.getEmail(), "Join Group Request Accepted", learner.getUsername(), group.getName(), formatedGroupUrl, EmailTemplateName.REQUEST_ACCEPTED);
        } else if (action.equals("REJECT")) {
            learnerGroup.setMemberStatus(MemberStatus.REJECTED);

            notificationDTO.setContent("Your request to join the group " + group.getName() + " has been rejected");
            notificationDTO.setActionType(ActionType.REQUEST_REJECTED);

            emailService.sendRequestRejectedEmail(learner.getEmail(), "Join Group Request Update", learner.getUsername(), group.getName(), formatedGroupUrl, EmailTemplateName.REQUEST_REJECTED);
        }

        learnerGroupRepository.save(learnerGroup);
        notificationService.sendNotificationToSingleLearner(learner.getId(), notificationDTO);
    }

    public void assignNewAdmin(Authentication connectedUser, Long groupId, String newAdminLearnerId) {
        String adminId = connectedUser.getName();
        Group group = groupRepository.findById(groupId).orElseThrow(EntityNotFoundException::new);
        Learner currentAdmin = learnerRepository.findById(adminId).orElseThrow(EntityNotFoundException::new);
        Learner newAdmin = learnerRepository.findById(newAdminLearnerId).orElseThrow(EntityNotFoundException::new);

        if (currentAdmin.equals(newAdmin)) {
            throw new OperationNotPermittedException("You can't assign yourself as an admin");
        }

        LearnerGroup currAdminLearnerGroup = learnerGroupRepository.findByLearnerAndGroup(currentAdmin, group).orElseThrow(EntityNotFoundException::new);
        LearnerGroup newAdminLearnerGroup = learnerGroupRepository.findByLearnerAndGroup(newAdmin, group).orElseThrow(EntityNotFoundException::new);

        if (!currAdminLearnerGroup.isAdmin()) {
            throw new NotGroupAdminException(group.getName());
        }

        if (learnerGroupRepository.existsByLearnerAndGroupAndMemberStatus(newAdmin, group, MemberStatus.MEMBER)) {
            throw new NotGroupMemberException(newAdmin.getUsername(), group.getName());
        }

        currAdminLearnerGroup.setAdmin(false);
        newAdminLearnerGroup.setAdmin(true);

        learnerGroupRepository.save(currAdminLearnerGroup);
        learnerGroupRepository.save(newAdminLearnerGroup);
    }

    public void leaveGroup(Authentication connectedUser, Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(EntityNotFoundException::new);
        String learnerId = connectedUser.getName();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow(EntityNotFoundException::new);

        LearnerGroup learnerGroup = learnerGroupRepository.findByLearnerAndGroup(learner, group).orElseThrow(EntityNotFoundException::new);

        if (learnerGroup.isAdmin() && group.getNoOfMembers() > 1) {
            throw new OperationNotPermittedException("You can't leave this group yet because you are still an admin of this group");
        }

        learnerGroup.setMemberStatus(MemberStatus.LEFT);

        learnerGroupRepository.save(learnerGroup);

        updateGroupCluster(group);
        groupRepository.save(group);
    }


    public List<GroupDTO> getCommonGroups(String username, Authentication connectedUser) {
        String learnerBId = connectedUser.getName();
        Learner learnerA = learnerRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("Learner not found with username " + username));
        Learner learnerB = learnerRepository.findById(learnerBId).orElseThrow(() -> new EntityNotFoundException("Learner not found with id " + learnerBId));

        return groupRepository.findCommonGroups(learnerA.getId(), learnerB.getId(), MemberStatus.MEMBER)
                .stream()
                .map(g -> groupMapper.toDTO(g, learnerA.getUsername(), messageRepository))
                .toList();
    }

    private void updateGroupCluster(Group group) {
        List<LearnerGroup> activeMembers = group.getLearnerGroups().stream()
                .filter(lg -> lg.getMemberStatus() == MemberStatus.MEMBER)
                .toList();

        // Calculate cluster distribution
        Map<Integer, Long> clusterCounts = activeMembers.stream()
                .map(m -> m.getLearner().getClusterId())
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
    }

    @Scheduled(cron = "0 45 0 * * *")
    @Transactional
    public void updateGroupCluster() {
        groupRepository.findAll().forEach(group -> {
            // Get ACTIVE MEMBERS only
            List<LearnerGroup> activeMembers = group.getLearnerGroups().stream()
                    .filter(lg -> lg.getMemberStatus() == MemberStatus.MEMBER)
                    .toList();

            // Calculate cluster distribution
            Map<Integer, Long> clusterCounts = activeMembers.stream()
                    .map(m -> m.getLearner().getClusterId())
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
            long interactionCount = group.getLearnerGroups().stream()
                    .filter(lg -> activeStatuses.contains(lg.getMemberStatus()))
                    .count();

            group.setPopularityScore(interactionCount);
            groupRepository.save(group);
        });
    }
}