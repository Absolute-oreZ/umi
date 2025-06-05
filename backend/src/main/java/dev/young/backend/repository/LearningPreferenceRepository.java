package dev.young.backend.repository;

import dev.young.backend.entity.Learner;
import dev.young.backend.entity.LearningPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LearningPreferenceRepository extends JpaRepository<LearningPreference,Long> {
    Optional<LearningPreference> findByLearner(Learner learner);
}