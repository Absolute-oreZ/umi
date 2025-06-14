package dev.young.backend.repository;

import dev.young.backend.entity.LearningPreference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningPreferenceRepository extends JpaRepository<LearningPreference,Long> {
}