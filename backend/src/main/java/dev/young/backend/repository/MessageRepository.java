package dev.young.backend.repository;

import dev.young.backend.entity.Group;
import dev.young.backend.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findMessagesByGroup(Group group);

    @Query("""
                SELECT COUNT(m)
                FROM Message m
                WHERE m.group.id = :groupId
                  AND (SELECT l FROM Learner l WHERE l.username = :username) NOT MEMBER OF m.seenByLearners
            """)
    int countUnseenMessagesByGroupIdAndUsername(@Param("groupId") Long groupId, @Param("username") String username);

    @Modifying
    @Query(value = """
                INSERT INTO message_seen (message_id, learner_id)
                SELECT m.id, :learnerId
                FROM message m
                WHERE m.group_id = :groupId
                AND m.id NOT IN (
                    SELECT ms.message_id FROM message_seen ms WHERE ms.learner_id = :learnerId
                )
            """, nativeQuery = true)
    void markAllMessagesAsSeenNative(@Param("groupId") Long groupId, @Param("learnerId") String learnerId);

    @Query("""
            SELECT m
            FROM Message m
            WHERE m.group.id = :groupId
                AND m.id <> :currentMessageId
            ORDER BY m.createdDate DESC
        """)
    List<Message> findLatestMessagesByGroupExcludingCurrent(@Param("groupId") Long groupId, @Param("currentMessageId") Long currentMessageId, Pageable pageable);
}