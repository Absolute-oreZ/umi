package dev.young.backend.controller;

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

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id){
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/current")
    public ResponseEntity<List<EventDTO>> getEventsByCurrentUser(Authentication authentication){
        return ResponseEntity.ok(eventService.getEventsByCurrentUser(authentication));
    }

//    @GetMapping("/group/{groupId}")
//    public ResponseEntity<List<EventDTO>> getEventsByGroup(@PathVariable Long groupId){
//        return ResponseEntity.ok(eventService.getEventsByGroup(groupId));
//    }

    @GetMapping("/group/{groupId}/upcoming")
    public ResponseEntity<List<EventDTO>> getUpcomingEventsByGroup(@PathVariable Long groupId, Authentication authentication){
        return ResponseEntity.ok(eventService.getUpcomingEventsByGroup(groupId,authentication));
    }

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    public void createNewEvent(@Valid @RequestBody NewEventDTO newEventDTO, Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        eventService.createEvent(newEventDTO,authentication);
    }

    @PatchMapping("/edit/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void updateEvent(@PathVariable Long id,@Valid @RequestBody EditEventDTO editEventDTO, Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        eventService.editEvent(id,editEventDTO,authentication);
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void deleteEvent(@PathVariable Long id, @RequestParam("notifyDeletion") boolean notifyDeletion, Authentication authentication) throws MessagingException, UnsupportedEncodingException {
        eventService.deleteEvent(id,notifyDeletion,authentication);
    }
}