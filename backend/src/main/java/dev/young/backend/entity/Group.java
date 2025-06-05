package dev.young.backend.entity;

import dev.young.backend.enums.MemberStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@ToString
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "_group")
public class Group extends BaseEntity {
    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String about;

    private String iconPath;

    private Integer dominantClusterId;
    private Double clusterMemberRatio;
    private Long popularityScore;

    @ManyToOne
    @JoinColumn(name = "last_message_id")
    private Message lastMessage;

    @OneToMany(mappedBy = "group")
    @Builder.Default
    private Set<LearnerGroup> learnerGroups = new HashSet<>();

    @OneToMany(mappedBy = "group")
    @OrderBy("createdDate DESC")
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @Transient
    public int getNoOfMembers() {
        return (int) learnerGroups.stream().filter(lg -> lg.getMemberStatus() == MemberStatus.MEMBER).count();
    }

    @Transient
    public List<Learner> getMembers() {
        return learnerGroups.stream()
                .filter(lg -> lg.getMemberStatus() == MemberStatus.MEMBER || lg.getMemberStatus() == MemberStatus.BOT)
                .map(LearnerGroup::getLearner)
                .toList();
    }


    @Transient
    public Learner getAdmin() {
        for (LearnerGroup lg : learnerGroups) {
            if (lg.isAdmin()) {
                return lg.getLearner();
            }
        }

        return null;
    }
}