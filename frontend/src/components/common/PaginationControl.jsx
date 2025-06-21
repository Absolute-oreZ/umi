import React from "react";
import { usePagination, DOTS } from "../../hooks/usePagination";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PaginationControl = ({
  onPageChange,
  totalCount,
  pageSize,
  currentPage,
  siblingCount = 1,
  totalPages
}) => {
  // const totalPages = Math.ceil(totalCount / pageSize);

  const paginationRange = usePagination({
    currentPage,
    totalPages,
    siblingCount,
  });

  if (paginationRange.length < 2) {
    return null;
  }

  const lastPage = totalPages - 1;

  const onPrevious = () => {
    if (currentPage > 0) onPageChange(currentPage - 1);
  };

  const onNext = () => {
    if (currentPage < lastPage) onPageChange(currentPage + 1);
  };

  return (
    <ul className="flex justify-end items-center w-full mt-4 space-x-2">
      <li>
        <button
          onClick={onPrevious}
          disabled={currentPage === 0}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <FiChevronLeft size={20} />
        </button>
      </li>

      {paginationRange.map((page, index) => {
        if (page === DOTS) {
          return (
            <li key={index} className="px-3 py-1 text-gray-500">
              &hellip;
            </li>
          );
        }

        const isSelected = page === currentPage;

        return (
          <li key={index}>
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-full text-sm ${
                isSelected
                  ? "bg-gray-200 text-black"
                  : "text-light-100 hover:bg-gray-200"
              }`}
            >
              {page + 1}
            </button>
          </li>
        );
      })}

      <li>
        <button
          onClick={onNext}
          disabled={currentPage === lastPage}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <FiChevronRight size={20} />
        </button>
      </li>
    </ul>
  );
};

export default PaginationControl;
