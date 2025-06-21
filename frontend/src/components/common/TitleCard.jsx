import { GiRamProfile } from "react-icons/gi";
import { formatImagePath } from "../../utils";

const TitleCard = ({ user, group, isAdmin }) => {
  const formattedPath =
    user && user.profilePicturePath
      ? formatImagePath(user.profilePicturePath)
      : group && group.iconPath
      ? formatImagePath(group.iconPath)
      : null;

  const name = user ? user.username : group.name;
  return (
    <div>
      {user ? (
        <div className="flex gap-5 w-full">
          {formattedPath ? (
            <img
              src={formattedPath}
              alt="Profile picture"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center">
              <GiRamProfile className="text-white text-xl" />
            </div>
          )}

          <div className="flex flex-col w-full gap-1">
            <p className="truncate text-sm">{name}</p>
            <span className="text-gray-100 text-xs">
              {isAdmin ? "Admin" : name === "UMI-BOT" ? "BOT" : "Member"}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex gap-5 w-full">
          {formattedPath ? (
            <img
              src={formattedPath}
              alt="Group Icon"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center">
              <GiRamProfile className="text-white text-xl" />
            </div>
          )}

          <div className="flex flex-col w-full">
            <p className="truncate text-sm">{name}</p>
            <p>{group && group.about}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleCard;
