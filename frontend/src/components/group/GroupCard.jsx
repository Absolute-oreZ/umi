import { GiRamProfile } from "react-icons/gi";
import {
  BsFiletypeDocx,
  BsFiletypePdf,
  BsFiletypeJpg,
  BsFiletypeMp4,
  BsFiletypeMp3,
} from "react-icons/bs";
import { formatImagePath, formatDate, getFileNameFromPath } from "../../utils";

const GroupCard = ({ group }) => {
  const { name, iconPath, lastMessage, noOfUnreadMessages } = group;

  const formattedPath = iconPath ? formatImagePath(iconPath) : null;
  const hasUnread = noOfUnreadMessages > 0;

  const renderLastMessageContent = () => {
    if (!lastMessage) return null;

    const { messageType, senderUsername, content, mediaPath } = lastMessage;

    switch (messageType) {
      case "TEXT":
      case "NOTICE":
        return (
          <p className="text-xs truncate max-w-50 text-gray-300">
            {senderUsername && <span>{senderUsername} : </span>}
            {content}
          </p>
        );

      case "IMAGE":
        return (
          <div className="flex items-center gap-1 text-xs text-gray-300 max-w-50 truncate">
            <BsFiletypeJpg />
            <span className="text-xs truncate max-w-50">{getFileNameFromPath(mediaPath)}</span>
          </div>
        );
      case "VIDEO":
        return (
          <div className="flex items-center gap-1 text-xs text-gray-300 max-w-50 truncate">
            <BsFiletypeMp4 />
            <span className="text-xs truncate max-w-50">{getFileNameFromPath(mediaPath)}</span>
          </div>
        );
      case "AUDIO":
        return (
          <div className="flex items-center gap-1 text-xs text-gray-300 max-w-50 truncate">
            <BsFiletypeMp3 />
            <span className="text-xs truncate max-w-50">{getFileNameFromPath(mediaPath)}</span>
          </div>
        );
      case "PDF":
        return (
          <div className="flex items-center gap-1 text-xs text-gray-300 max-w-50 truncate">
            <BsFiletypePdf />
            <span className="text-xs truncate max-w-50">{getFileNameFromPath(mediaPath)}</span>
          </div>
        );
      case "DOCX":
        return (
          <div className="flex items-center gap-1 text-xs text-gray-300 max-w-50 truncate">
            <BsFiletypeDocx />
            <span className="text-xs truncate max-w-50">{getFileNameFromPath(mediaPath)}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-5 w-full">
      {formattedPath ? (
        <img
          src={formattedPath}
          alt="Group Icon"
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
          <GiRamProfile className="text-white text-xl" />
        </div>
      )}

      <div className="flex flex-col w-full">
        <div className="flex justify-between w-full mb-1">
          <p className="truncate max-w-35 text-sm">{name}</p>
          {lastMessage && (
            <p
              className={`text-sm ${
                hasUnread ? "text-purple-400" : "text-white"
              }`}
            >
              {formatDate(lastMessage.createdDate)}
            </p>
          )}
        </div>

        <div className="flex justify-between w-full mt-1 items-center">
          {renderLastMessageContent()}
          {hasUnread && (
            <div className="flex rounded-full w-5 h-5 justify-center items-center bg-purple-400 text-white text-sm">
              {noOfUnreadMessages}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
