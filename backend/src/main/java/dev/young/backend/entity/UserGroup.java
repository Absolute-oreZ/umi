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
public class UserGroup extends BaseEntity {

    private boolean isAdmin;

    @Enumerated(EnumType.STRING)
    private MemberStatus memberStatus;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Profile user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;
}