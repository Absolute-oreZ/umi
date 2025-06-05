import React from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdClose } from "react-icons/md";

const SearchMessageBar = ({
  searchQuery,
  setSearchQuery,
  showSearchBar,
  onClose,
  onNextMatch,
  onPrevMatch,
  currentMatchIndex,
  matchedMessageIndexes,
}) => {
  if (!showSearchBar) return null;

  return (
    <div className="overlay fixed inset-0 z-50 bg-opacity-50">
      <div className="flex ml-auto mt-14 bg-gray-700  gap-4 p-3 rounded-sm shadow-lg w-84 border border-gray-900">
        <div className="flex border-b-2 bg-transparent border-sm w-50 text-white px-2 py-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onNextMatch();
              }
            }}
            autoFocus
            placeholder="Search within chat"
            className="focus:outline-none text-clip w-35"
          />
          {matchedMessageIndexes.length > 0 && (
            <span className="text-sm w-10 text-gray-300 ml-2 whitespace-nowrap flex items-center gap-x-1">
              <span>{currentMatchIndex + 1}</span>
              <span>of</span>
              <span>{matchedMessageIndexes.length}</span>
            </span>
          )}
        </div>
        <button onClick={onPrevMatch}>
          <IoIosArrowUp />
        </button>
        <button onClick={onNextMatch}>
          <IoIosArrowDown />
        </button>
        <span className="text-white">|</span>
        <button onClick={onClose}>
          <MdClose />
        </button>
      </div>
    </div>
  );
};

export default SearchMessageBar;
