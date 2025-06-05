import { GiRamProfile } from "react-icons/gi";
import { formatImagePath } from "../../utils";

const TitleCard = ({ learner, group, isAdmin }) => {
  const formattedPath =
    learner && learner.profilePicturePath
      ? formatImagePath(learner.profilePicturePath)
      : group && group.iconPath
      ? formatImagePath(group.iconPath)
      : null;

  const name = learner ? learner.username : group.name;
  return (
    <div>
      {learner ? (
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
            {isAdmin ? <span className="text-gray-100 text-xs">Admin</span> : <span className="text-gray-100 text-xs">Member</span>}
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
