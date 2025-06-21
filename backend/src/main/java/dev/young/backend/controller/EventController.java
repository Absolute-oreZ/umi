package dev.young.backend.controller;

import dev.young.backend.dto.event.DeleteEventDTO;
import dev.young.backend.dto.event.EditEventDTO;
import dev.young.backend.dto.event.EventDTO;
import dev.young.backend.dto.event.NewEventDTO;
import dev.young.backend.service.EventService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    @GetMapping("/{groupId}")
    public ResponseEntity<List<EventDTO>> getEventsByGroup(@PathVariable Long groupId, Authentication authentication){
        return ResponseEntity.ok(eventService.getEventsByGroup(groupId,authentication));
    }

    @GetMapping("/upcoming/{groupId}")
    public ResponseEntity<List<EventDTO>> getUpcomingEventsByGroup(@PathVariable Long groupId, Authentication authentication){
        return ResponseEntity.ok(eventService.getUpcomingEventsByGroup(groupId,authentication));
    }

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    public void createNewEvent(@Valid @RequestBody NewEventDTO newEventDTO, Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        eventService.createEvent(newEventDTO,authentication);
    }

    @PatchMapping("/edit")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void updateEvent(@Valid @RequestBody EditEventDTO editEventDTO,Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        eventService.editEvent(editEventDTO,authentication);
    }

    @DeleteMapping("/cancel")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void cancelEvent(@Valid @RequestBody DeleteEventDTO deleteEventDTO, Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        eventService.cancelEvent(deleteEventDTO,authentication);
    }
}