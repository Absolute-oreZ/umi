package dev.young.backend.repository;

import dev.young.backend.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<Profile,UUID> {
    Optional<Profile> findByUsername(String username);
    boolean existsByUsername(String username);
}