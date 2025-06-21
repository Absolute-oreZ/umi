package dev.young.backend.dto;

import java.util.List;

public record PagedResponse<T>(
        List<T> content,
        int currentPage,
        int pageSize,
        int totalPages,
        long totalElements
) {}