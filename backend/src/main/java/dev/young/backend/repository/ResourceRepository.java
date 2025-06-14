package dev.young.backend.repository;

import dev.young.backend.entity.Resource;
import dev.young.backend.enums.FileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    public List<Resource> searchByCategory(FileType category);

    @Query("""
            SELECT r
            FROM Resource r
            WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    List<Resource> searchByQuery(@Param("query") String query);

    @Query("""
            SELECT r
            FROM Resource r
            WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%'))
              AND r.category = :category
            """)
    List<Resource> searchByQueryAndCategory(@Param("query") String query, @Param("category") FileType category);
}