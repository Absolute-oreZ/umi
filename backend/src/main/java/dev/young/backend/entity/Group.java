package dev.young.backend.entity;

import dev.young.backend.enums.MemberStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.*;

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
    private Set<UserGroup> userGroups = new HashSet<>();

    @OneToMany(mappedBy = "group")
    @OrderBy("createdDate DESC")
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "group")
    @OrderBy("startDate DESC")
    @Builder.Default
    private List<Event> events = new ArrayList<>();

    @Transient
    public int getNoOfMembers() {
        return (int) userGroups.stream().filter(ug -> ug.getMemberStatus() == MemberStatus.MEMBER).count();
    }

    @Transient
    public List<User> getMembers() {
        return userGroups.stream()
                .filter(ug -> ug.getMemberStatus() == MemberStatus.MEMBER || ug.getMemberStatus() == MemberStatus.BOT)
                .sorted(Comparator.comparing(ug -> ug.getUser().getUsername(), String::compareToIgnoreCase))
                .map(UserGroup::getUser)
                .toList();
    }

    @Transient
    public User getAdmin() {
        for (UserGroup ug : userGroups) {
            if (ug.isAdmin()) {
                return ug.getUser();
            }
        }

        return null;
    }
}