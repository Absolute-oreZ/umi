package dev.young.backend.service;

import dev.young.backend.dto.event.EditEventDTO;
import dev.young.backend.dto.event.EventDTO;
import dev.young.backend.dto.event.NewEventDTO;
import dev.young.backend.dto.exception.NotGroupMemberException;
import dev.young.backend.entity.*;
import dev.young.backend.enums.EmailTemplateName;
import dev.young.backend.enums.MemberStatus;
import dev.young.backend.enums.MessageType;
import dev.young.backend.mapper.EventMapper;
import dev.young.backend.repository.*;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    @Value("${application.bot.id}")
    private String botId;

    private final EmailService emailService;
    private final EventMapper eventMapper;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final EventRepository eventRepository;
    private final MessageRepository messageRepository;
    private final UserGroupRepository userGroupRepository;

    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not Found with id " + id));
        User eventCreator = userRepository.findById(event.getCreatedBy()).orElseThrow(() -> new EntityNotFoundException("user not found with id " + event.getCreatedBy()));
        return eventMapper.toDTO(event, eventCreator.getUsername());
    }


    public List<EventDTO> getEventsByCurrentUser(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();

        List<Group> groups = userGroupRepository.findCurrentGroupsByUser(userId, MemberStatus.MEMBER);
        List<Event> events = new ArrayList<>();

        for (Group g : groups) {
            events.addAll(getEventsByGroup(g.getId()));
        }

        // collect all creator IDs
        Set<UUID> creatorIds = events.stream()
                .map(BaseEntity::getCreatedBy)
                .collect(Collectors.toSet());

        // fetch all creators in one query
        Map<UUID, User> creators = userRepository.findAllById(creatorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return events.stream()
                .sorted(Comparator.comparing(Event::getStartDate))
                .map(event -> {
                    UUID creatorId = event.getCreatedBy();
                    User creator = creators.get(creatorId);
                    if (creator == null) {
                        throw new EntityNotFoundException("User not found with id " + creatorId);
                    }
                    return eventMapper.toDTO(event, creator.getUsername());
                })
                .collect(Collectors.toList());
    }

    private List<Event> getEventsByGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));

        return eventRepository.findByGroupOrderByStartDateDesc(group);
    }

    public List<EventDTO> getUpcomingEventsByGroup(Long groupId, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id " + userId));

        if (!userGroupRepository.existsByUserAndGroupAndMemberStatus(user, group, MemberStatus.MEMBER)) {
            throw new NotGroupMemberException(user.getUsername(), group.getName());
        }

        List<Event> events = eventRepository.findByGroupOrderByStartDateDesc(group);

        // collect all creator IDs
        Set<UUID> creatorIds = events.stream()
                .map(Event::getCreatedBy)
                .collect(Collectors.toSet());

        // fetch all creators in one query
        Map<UUID, User> creators = userRepository.findAllById(creatorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return events.stream()
                .filter(event -> event.getStartDate().isAfter(LocalDateTime.now()))
                .map(event -> {
                    UUID creatorId = event.getCreatedBy();
                    User creator = creators.get(creatorId);
                    if (creator == null) {
                        throw new EntityNotFoundException("User not found with id " + creatorId);
                    }
                    return eventMapper.toDTO(event, creator.getUsername());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void createEvent(NewEventDTO newEventDTO, Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        UUID userId = (UUID) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("user not found with id " + userId));
        User bot = userRepository.findById(UUID.fromString(botId)).orElseThrow(() -> new EntityNotFoundException("Bot not found"));
        List<User> activeMembers = userGroupRepository.findUsersByGroupId(newEventDTO.getGroupId(), MemberStatus.MEMBER);


        Event newEvent = eventMapper.toEntity(newEventDTO, groupRepository);

        if (!activeMembers.contains(user)) {
            throw new NotGroupMemberException(user.getUsername(), newEvent.getGroup().getName());
        }

        eventRepository.save(newEvent);

        Message message = Message.builder()
                .messageType(MessageType.NOTICE)
                .senderUsername(bot.getUsername())
                .group(newEvent.getGroup())
                .content(user.getUsername() + " scheduled an event " + newEvent.getTitle())
                .build();

        messageRepository.save(message);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String formattedStartDate = newEvent.getStartDate() == null ? null : newEvent.getStartDate().format(formatter);
        String formattedEndDate = newEvent.getEndDate() == null ? null : newEvent.getEndDate().format(formatter);

        if (newEvent.isNotifyMembers()) {
            for (User activeMember : activeMembers) {
                if (activeMember.equals(user)) continue;
                emailService.notifyCreatedEvent(activeMember.getEmail(), "New Event Notification", activeMember.getUsername(), newEvent.getGroup().getName(), newEvent.getEventLink(), newEvent.getTitle(), formattedStartDate, formattedEndDate, user.getUsername(), newEventDTO.getRemindBeforeInMinutes(), EmailTemplateName.NEW_EVENT);
            }
        }
    }

    @Transactional
    public void editEvent(Long id, EditEventDTO editEventDTO, Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        UUID userId = (UUID) authentication.getPrincipal();
        User bot = userRepository.findById(UUID.fromString(botId)).orElseThrow(() -> new EntityNotFoundException("Bot not found"));
        Event event = eventRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not found with id " + id));
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("user not found with id " + userId));
        User creator = userRepository.findById(event.getCreatedBy()).orElseThrow(() -> new EntityNotFoundException("Event creator not found"));
        Group group = event.getGroup();
        List<User> activeMembers = userGroupRepository.findUsersByGroupId(group.getId(), MemberStatus.MEMBER);

        if (!activeMembers.contains(user)) {
            throw new NotGroupMemberException(user.getUsername(), group.getName());
        }

        if (!user.equals(creator)) {
            throw new IllegalStateException("Current connected user is not the creator of the event");
        }

        Map<String, String> changes = new HashMap<>(); // store changed attribute and its changes
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String formattedNewStartDate = editEventDTO.getStartDate() == null ? null : editEventDTO.getStartDate().format(formatter);
        String formattedNewEndDate = editEventDTO.getEndDate() == null ? null : editEventDTO.getEndDate().format(formatter);

        if (editEventDTO.getTitle() != null) {
            changes.put("Title", event.getTitle() + " -> " + editEventDTO.getTitle());
            event.setTitle(editEventDTO.getTitle());
        }

        if (editEventDTO.getEventLink() != null) {
            changes.put("Event Link", event.getEventLink() + " -> " + editEventDTO.getEventLink());
            event.setEventLink(editEventDTO.getEventLink());
        }

        if (editEventDTO.getStartDate() != null) {
            String formattedOldStartDate = event.getStartDate() == null ? null : event.getStartDate().format(formatter);
            String changeMessage = formattedOldStartDate == null ? "Event scheduled at " + formattedNewStartDate : formattedOldStartDate + " -> " + formattedNewStartDate;
            if (event.getStartDate() != null && event.getRemindAt() != null) {
                long minutes = ChronoUnit.MINUTES.between(event.getStartDate(), event.getRemindAt());
                LocalDateTime newRemindAt = editEventDTO.getStartDate().minusMinutes(minutes);
                event.setRemindAt(newRemindAt);
            }
            changes.put("Starts", changeMessage);
            event.setStartDate(editEventDTO.getStartDate());
        }

        if (editEventDTO.getEndDate() != null) {
            String formattedOldEndDate = event.getEndDate() == null ? null : event.getEndDate().format(formatter);
            String changeMessage = formattedOldEndDate == null ? "Event is now ending at " + formattedNewEndDate : formattedOldEndDate + " -> " + formattedNewEndDate;
            changes.put("Ends", changeMessage);
            event.setEndDate(editEventDTO.getEndDate());
        }

        eventRepository.save(event);

        Message message = Message.builder()
                .messageType(MessageType.NOTICE)
                .senderUsername(bot.getUsername())
                .group(group)
                .content(user.getUsername() + " made some changes to the event " + event.getTitle())
                .build();

        messageRepository.save(message);

        if (editEventDTO.isNotifyChanges()) {
            for (User activeMember : activeMembers) {
                if (user.equals(activeMember)) {
                    continue;
                }
                long minutes = event.getStartDate() != null && event.getRemindAt() != null ? ChronoUnit.MINUTES.between(event.getStartDate(), event.getRemindAt()) : null;
                emailService.notifyEventChanges(activeMember.getEmail(), "Event Changes Update", activeMember.getUsername(), event.getGroup().getName(), event.getEventLink(), event.getTitle(), formattedNewStartDate, formattedNewEndDate, user.getUsername(), (int) minutes, changes, EmailTemplateName.EVENT_CHANGED);
            }
        }
    }

    public void deleteEvent(Long eventId, boolean notifyDeletion, Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        UUID userId = (UUID) authentication.getPrincipal();
        User bot = userRepository.findById(UUID.fromString(botId)).orElseThrow(() -> new EntityNotFoundException("Bot not found"));
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new EntityNotFoundException("Event not found with id " + eventId));
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("user not found with id " + userId));
        User creator = userRepository.findById(event.getCreatedBy()).orElseThrow(() -> new EntityNotFoundException("Event creator not found"));
        Group group = event.getGroup();
        List<User> activeMembers = userGroupRepository.findUsersByGroupId(group.getId(), MemberStatus.MEMBER);

        if (!activeMembers.contains(user)) {
            throw new NotGroupMemberException(user.getUsername(), group.getName());
        }

        if (!user.equals(creator)) {
            throw new IllegalStateException("Current connected user is not the creator of the event");
        }

        eventRepository.delete(event);

        Message message = Message.builder()
                .messageType(MessageType.NOTICE)
                .senderUsername(bot.getUsername())
                .group(group)
                .content(user.getUsername() + " deleted the event " + event.getTitle())
                .build();

        messageRepository.save(message);

        if (notifyDeletion) {
            for (User activeMember : activeMembers) {
                if (user.equals(activeMember)) {
                    continue;
                }

                emailService.notifyEventCancelled(
                        activeMember.getEmail(),
                        "Event Cancelled Notification",
                        activeMember.getUsername(),
                        group.getName(),
                        event.getTitle(),
                        EmailTemplateName.EVENT_CANCELLED
                );
            }
        }
    }
}