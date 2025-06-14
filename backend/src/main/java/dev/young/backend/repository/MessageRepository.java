package dev.young.backend.repository;

import dev.young.backend.entity.Group;
import dev.young.backend.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findMessagesByGroup(Group group);

    @Query("""
                SELECT COUNT(m)
                FROM Message m
                WHERE m.group.id = :groupId
                  AND (SELECT u FROM Profile u WHERE u.username = :username) NOT MEMBER OF m.seenByUsers
            """)
    int countUnseenMessagesByGroupIdAndUsername(@Param("groupId") Long groupId, @Param("username") String username);

    @Modifying
    @Query(value = """
                INSERT INTO message_seen (message_id, user_id)
                SELECT m.id, :userId
                FROM message m
                WHERE m.group_id = :groupId
                ON CONFLICT (message_id,user_id) DO NOTHING
            """, nativeQuery = true)
    void markAllMessagesAsSeenNative(@Param("groupId") Long groupId, @Param("userId") UUID userId);

    @Query("""
            SELECT m
            FROM Message m
            WHERE m.group.id = :groupId
                AND m.id <> :currentMessageId
            ORDER BY m.createdDate DESC
        """)
    List<Message> findLatestMessagesByGroupExcludingCurrent(@Param("groupId") Long groupId, @Param("currentMessageId") Long currentMessageId, Pageable pageable);
}