package dev.young.backend.repository;

import dev.young.backend.entity.Resource;
import dev.young.backend.enums.FileType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    @Query("""
            SELECT r
            FROM Resource r
            WHERE LOWER(r.name) LIKE LOWER(CONCAT('%',:query,'%'))
                AND (:category IS NULL OR r.category = :category)
            """)
    Page<Resource> searchByQueryAndOptionalCategory(
            @Param("query") String query,
            @Param("category") FileType category,
            Pageable pageable
    );
}