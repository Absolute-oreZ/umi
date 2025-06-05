package dev.young.backend.repository;

import dev.young.backend.entity.Learner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LearnerRepository extends JpaRepository<Learner,String> {
    Optional<Learner> findByEmail(String email);
    Optional<Learner> findByUsername(String username);
    Optional<Learner> findById(String id);
}