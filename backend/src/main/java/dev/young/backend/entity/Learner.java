package dev.young.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Learner {

    @Id
    private String id; // keycloak User Id

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String username;

    private String profilePicturePath;
    private boolean isAccountPremium;
    private Integer clusterId;
    private LocalDateTime clusterUpdatedAt;
    private LocalDateTime lastSeen;

    @OneToOne(mappedBy = "learner", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private LearningPreference learningPreference;

    @Builder.Default
    @OneToMany(mappedBy = "learner")
    private Set<LearnerGroup> learnerGroups = new HashSet<>();

    @Builder.Default
    @ManyToMany(mappedBy = "seenByLearners",fetch = FetchType.LAZY)
    private Set<Message> seenMessages = new HashSet<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(insertable = false)
    private LocalDateTime lastModifiedDate;

    @Transient
    public boolean isOnline() {
        return lastSeen != null && lastSeen.isAfter(LocalDateTime.now().minusMinutes(1));
    }
}