import { FaLocationDot } from "react-icons/fa6";
import { formatTimestamp, formatImagePath } from "../../utils";
import TitleCard from "./TitleCard";

const DetailsCard = ({
  user,
  group,
  toggleCard,
  isCardVisible,
  commonGroups,
}) => {
  const formattedPath =
    user && user.profilePicturePath
      ? formatImagePath(user.profilePicturePath)
      : group && group.iconPath
      ? formatImagePath(group.iconPath)
      : null;

  const name = user ? user.username : group.name;

  return (
    <div
      className="overlay fixed inset-0 z-50 transition-opacity duration-300 -ml-9 -mt-10"
      onClick={toggleCard}
    >
      <div
        className={`flex flex-1 ml-110 border-1 border-gray-700 bg-gray-800 flex-col gap-4 p-6 rounded-md shadow-lg w-sm  overflow-y-auto ${
          isCardVisible && "opacity-100 translate-y-12 slide-down"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {user ? (
          <>
            <div className="rounded-lg flex items-center justify-center">
              {formattedPath ? (
                <img
                  src={formattedPath}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-600"
                />
              ) : (
                <CgProfile className="w-20 h-20" />
              )}

              <div className="flex flex-col gap-3 text-left ml-4">
                <p className="text-3xl font-semibold">{name}</p>
                <div className="flex items-center text-sm text-gray-400">
                  <FaLocationDot />
                  <p>{user.learningPreference.country || "Laughtale"}</p>
                </div>
              </div>

              {/* Badges Section */}
              <div className="rounded-lg ml-6 w-50 overflow-x-auto hide-scrollbar">
                <h2 className="text-xl text-center font-semibold text-pink-500 mb-2">
                  Badges
                </h2>
                <div className="flex space-x-4 text-base border-t-2 rounded-md border-cyan-500 py-3">
                  {user.accountPremium ? (
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ Premium Member
                    </span>
                  ) : (
                    <p>No badges yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg p-6">
              <h2 className="text-xl text-center mb-2 font-semibold text-gradient">
                Hello There, {name} Here
              </h2>
              <p className="text-base text-justify border-t-2 rounded-md border-cyan-500 py-3">
                Hello, I'm {name} from{" "}
                {user.learningPreference.country || "an unknown location"}! I
                enjoy learning through a combination of{" "}
                {user.learningPreference.learningStyles.map(
                  (style, index) => (
                    <span
                      key={index}
                      className={`${
                        index !==
                        user.learningPreference.learningStyles.length - 1
                          ? "mr-1"
                          : ""
                      } text-blue-400`}
                    >
                      {style}
                      {index !==
                      user.learningPreference.learningStyles.length - 1
                        ? ","
                        : ""}
                    </span>
                  )
                )}
                . I'm actually an{" "}
                <span className="text-cyan-400">
                  {user.learningPreference.personality}
                </span>
                . Feel free to drop me a message at{" "}
                <a
                  className="hover:underline hover:text-blue-400"
                  target="_blank"
                  href={`mailto:${user.email}`}
                >
                  {user.email}
                </a>
              </p>
            </div>
            <div className="rounded-lg p-6">
              <h2 className="text-xl text-center mb-2 font-semibold text-orange-400">
                Groups in common ({commonGroups.length})
              </h2>
              <div className="text-base text-justify border-t-2 rounded-md border-cyan-500 py-3">
                {commonGroups.map((group) => (
                  <div
                    className="flex items-center gap-5 w-full"
                    key={group.id}
                  >
                    <img
                      src={formatImagePath(group.iconPath) || <GiRamProfile />}
                      alt="group Icon"
                      className="flex items-center justify-center w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <h4 className="text-lg max-w-[180px] truncate">
                        {group.name}
                      </h4>
                      <p className="text-sm max-w-[180px] truncate">
                        {group.noOfMembers} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg flex flex-col items-center justify-center mb-2">
              {formattedPath ? (
                <img
                  src={formattedPath}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-600 mb-6"
                />
              ) : (
                <CgProfile className="w-20 h-20" />
              )}

              <h3 className="text-xl">{name}</h3>
            </div>

            <div className="flex flex-col mb-2">
              <p className="text-light-100">Created</p>
              {formatTimestamp(group.createdDate)}
            </div>

            <div className="flex flex-col mb-2">
              <p className="text-light-100">Description</p>
              {group.about}
            </div>

            <div className="flex flex-col mb-2 gap-2">
              <p className="text-light-100">Members</p>
              {group.members.map((member) => (<TitleCard key={member.id} user={member} isAdmin={member.id === group.admin.id} />))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailsCard;
