package dev.young.backend.repository;

import dev.young.backend.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<Profile,String> {
    Optional<Profile> findByUsername(String username);
    Optional<Profile> findById(UUID id);
    boolean existsById(UUID id);
    boolean existsByUsername(String username);
}