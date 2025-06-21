import { useMemo } from "react";

export const DOTS = '...';

const range = (start, end) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
};

export const usePagination = ({
    siblingCount = 1,
    currentPage,
    totalPages,
}) => {
    const paginationRange = useMemo(() => {
        const totalPageNumbers = siblingCount + 5;

        // If total pages is less than the page numbers we want to show, return full range
        if (totalPageNumbers >= totalPages) {
            return range(0, totalPages - 1); // 0-based
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 0);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);

        const shouldShowLeftDots = leftSiblingIndex > 1;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 0;
        const lastPageIndex = totalPages - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftRange = range(0, 2 + 2 * siblingCount);
            return [...leftRange, DOTS, lastPageIndex];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightRange = range(totalPages - (3 + 2 * siblingCount), totalPages - 1);
            return [firstPageIndex, DOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }

    }, [totalPages, siblingCount, currentPage]);

    return paginationRange;
};
