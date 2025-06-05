package dev.young.backend.entity;

import dev.young.backend.enums.MemberStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LearnerGroup extends BaseEntity {

    private boolean isAdmin;

    @Enumerated(EnumType.STRING)
    private MemberStatus memberStatus;

    @ManyToOne
    @JoinColumn(name = "learner_id")
    private Learner learner;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;
}