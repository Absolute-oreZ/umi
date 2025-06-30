package dev.young.backend.repository;

import dev.young.backend.entity.Event;
import dev.young.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event,Long> {
    List<Event> findByGroupOrderByStartDateDesc(Group group);
}