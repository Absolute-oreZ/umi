package dev.young.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPreference extends BaseEntity {

    private String country;
    private String personality;
    @Builder.Default
    private Set<String> learningStyles = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}