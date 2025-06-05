package dev.young.backend.repository;

import dev.young.backend.entity.Group;
import dev.young.backend.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByName(String name);

    @Query("""
            SELECT g
            FROM Group g
            JOIN g.learnerGroups lg
            WHERE ABS(g.dominantClusterId - :clusterId) <= 1
              AND lg.memberStatus = :memberStatus
            GROUP BY g
            HAVING COUNT(lg) < 5
            ORDER BY g.clusterMemberRatio DESC
            """)
    List<Group> findRecommendations(@Param("clusterId") Integer clusterId, @Param("memberStatus") MemberStatus memberStatus);


    @Query("SELECT g FROM Group g ORDER BY g.popularityScore DESC")
    List<Group> findPopularGroups();

    @Query("""
            SELECT g FROM Group g
            JOIN LearnerGroup lg1 ON lg1.group = g
            JOIN LearnerGroup lg2 ON lg2.group = g
            WHERE (lg1.learner.id = :learnerAId AND lg1.memberStatus = :memberStatus)
                AND (lg2.learner.id = :learnerBId AND lg2.memberStatus = :memberStatus)
            ORDER BY g.createdDate
            """)
    List<Group> findCommonGroups(String learnerAId, String learnerBId, MemberStatus memberStatus);
}