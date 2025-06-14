package dev.young.backend.repository;

import dev.young.backend.dto.group.JoinGroupRequestDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.entity.Profile;
import dev.young.backend.entity.UserGroup;
import dev.young.backend.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {
    Optional<UserGroup> findByUserAndGroup(Profile user, Group group);

    @Query("SELECT ug.user FROM UserGroup ug WHERE ug.group.id = :groupId AND ug.user.username != 'BOT' AND ug.memberStatus = :memberStatus")
    List<Profile> findUsersByGroupId(@Param("groupId") Long groupId, @Param("memberStatus") MemberStatus memberStatus);

    @Query("SELECT ug.user FROM UserGroup ug WHERE ug.group.id =:groupId AND ug.isAdmin = true")
    Optional<Profile> findGroupAdminByGroup(@Param("groupId") Long groupId);

    boolean existsByUserAndGroupAndMemberStatus(Profile user, Group group, MemberStatus memberStatus);

    @Query(value = """
                SELECT ug.group
                FROM UserGroup ug
                WHERE ug.user.id = :userId AND ug.memberStatus = :status
                ORDER BY COALESCE(ug.group.lastModifiedDate, ug.group.createdDate) DESC
            """)
    List<Group> findCurrentGroupsByUser(@Param("userId") UUID userId, @Param("status") MemberStatus status);

    @Query("""
                SELECT new dev.young.backend.dto.group.JoinGroupRequestDTO(
                    ug.id,
                    ug.user.username,
                    ug.user.profilePicturePath,
                    ug.group.name,
                    ug.group.iconPath
                )
                FROM UserGroup ug
                WHERE ug.user.id = :userId
                AND ug.memberStatus = :memberStatus
            """)
    List<JoinGroupRequestDTO> findPendingRequestsForCurrentUser(@Param("userId") UUID userId, @Param("memberStatus") MemberStatus memberStatus);

    @Query("""
                SELECT new dev.young.backend.dto.group.JoinGroupRequestDTO(
                    ug.id,
                    ug.user.username,
                    ug.user.profilePicturePath,
                    ug.group.name,
                    ug.group.iconPath
                )
                FROM UserGroup ug
                WHERE ug.group.id IN (
                    SELECT ug2.group.id
                    FROM UserGroup ug2
                    WHERE ug2.user.id = :userId
                      AND ug2.isAdmin = true
                )
                AND ug.memberStatus = :memberStatus
                ORDER BY ug.createdDate DESC
            """)
    List<JoinGroupRequestDTO> findPendingRequestsForGroupsAdministeredBy(@Param("userId") UUID userId, @Param("memberStatus") MemberStatus memberStatus);
}