package dev.young.backend.repository;

import dev.young.backend.dto.group.JoinGroupRequestDTO;
import dev.young.backend.entity.Group;
import dev.young.backend.entity.Learner;
import dev.young.backend.entity.LearnerGroup;
import dev.young.backend.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LearnerGroupRepository extends JpaRepository<LearnerGroup, Long> {
    Optional<LearnerGroup> findByLearnerAndGroup(Learner learner, Group group);

    @Query("SELECT lg.learner FROM LearnerGroup lg WHERE lg.group.id = :groupId AND lg.learner.username != 'BOT' AND lg.memberStatus = :memberStatus")
    List<Learner> findLearnersByGroupId(@Param("groupId") Long groupId,@Param("memberStatus") MemberStatus memberStatus);

    @Query("SELECT lg.learner FROM LearnerGroup lg WHERE lg.group.id =:groupId AND lg.isAdmin = true")
    Optional<Learner> findGroupAdminByGroup(@Param("groupId") Long groupId);

    boolean existsByLearnerAndGroupAndMemberStatus(Learner learner, Group group, MemberStatus memberStatus);

    @Query(value = """
                SELECT lg.group
                FROM LearnerGroup lg
                WHERE lg.learner.id = :learner AND lg.memberStatus = :status
                ORDER BY COALESCE(lg.group.lastModifiedDate, lg.group.createdDate) DESC
            """)
    List<Group> findCurrentGroupsByLearner(@Param("learner") String learnerId, @Param("status") MemberStatus status);

    @Query("""
                SELECT new dev.young.backend.dto.group.JoinGroupRequestDTO(
                    lg.id,
                    lg.learner.username,
                    lg.group.name
                )
                FROM LearnerGroup lg
                WHERE lg.learner.id = :learnerId
                AND lg.memberStatus = :memberStatus
            """)
    List<JoinGroupRequestDTO> findPendingRequestsForCurrentLearner(@Param("learnerId") String learnerId, @Param("memberStatus") MemberStatus memberStatus);

    @Query("""
                SELECT new dev.young.backend.dto.group.JoinGroupRequestDTO(
                    lg.id,
                    lg.learner.username,
                    lg.group.name
                )
                FROM LearnerGroup lg
                WHERE lg.group.id IN (
                    SELECT lg2.group.id
                    FROM LearnerGroup lg2
                    WHERE lg2.learner.id = :learnerId
                      AND lg2.isAdmin = true
                )
                AND lg.memberStatus = :memberStatus
                ORDER BY lg.createdDate DESC
            """)
    List<JoinGroupRequestDTO> findPendingRequestsForGroupsAdministeredBy(@Param("learnerId") String learnerId, @Param("memberStatus") MemberStatus memberStatus);
}