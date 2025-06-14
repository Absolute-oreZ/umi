package dev.young.backend.repository;

import dev.young.backend.entity.Group;
import dev.young.backend.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, Long> {
    @Query("""
            SELECT g
            FROM Group g
            JOIN g.userGroups ug
            WHERE ABS(g.dominantClusterId - :clusterId) <= 1
              AND ug.memberStatus = :memberStatus
            GROUP BY g
            HAVING COUNT(ug) < 5
            ORDER BY g.clusterMemberRatio DESC
            """)
    List<Group> findRecommendations(@Param("clusterId") Integer clusterId, @Param("memberStatus") MemberStatus memberStatus);

    @Query("SELECT g FROM Group g ORDER BY g.popularityScore DESC")
    List<Group> findPopularGroups();

    @Query("""
            SELECT g FROM Group g
            JOIN UserGroup ug1 ON ug1.group = g
            JOIN UserGroup ug2 ON ug2.group = g
            WHERE (ug1.user.id = :userAId AND ug1.memberStatus = :memberStatus)
                AND (ug2.user.id = :userBId AND ug2.memberStatus = :memberStatus)
            ORDER BY g.createdDate
            """)
    List<Group> findCommonGroups(UUID userAId, UUID userBId, MemberStatus memberStatus);
}