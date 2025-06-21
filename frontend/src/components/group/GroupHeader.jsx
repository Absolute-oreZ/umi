import { MdGroups3, MdOutlineSearch } from "react-icons/md";
import { CiCloudMoon } from "react-icons/ci";
import { formatImagePath } from "../../utils";

const GroupHeader = ({
  iconPath,
  name,
  members,
  handleHeaderClicked,
  handleSearchButtonClicked,
  handleOpenEventContainer,
  fetchUpcomingEventsByGroup
}) => {
  const formattedIconPath = iconPath ? formatImagePath(iconPath) : null;

  return (
    <div
      onClick={handleHeaderClicked}
      className="flex w-full justify-between items-center px-6 py-2 border-b-1 border-black"
    >
      <div className="flex gap-2">
        {formattedIconPath ? (
          <img
            src={formattedIconPath}
            alt="Media"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <MdGroups3 className="w-12 h-12" />
        )}
        <div className="flex flex-col">
          <p className="text-sm">{name}</p>
          <div className="flex">
            {members.map((member, index) => (
              <p className="text-xs flex" key={index}>
                {member.username}
                {index < members.length - 1 && <span>,&nbsp;</span>}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            fetchUpcomingEventsByGroup();
            handleOpenEventContainer();
          }}
          className="relative hover:bg-gray-500 group rounded-md p-3"
        >
          <CiCloudMoon />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-1 transition-all duration-300 pointer-events-none z-20">
            Events
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSearchButtonClicked();
          }}
          className="relative hover:bg-gray-500 group rounded-md p-3"
        >
          <MdOutlineSearch />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-1 transition-all duration-300 pointer-events-none z-20">
            Search
          </span>
        </button>
      </div>
    </div>
  );
};

export default GroupHeader;
