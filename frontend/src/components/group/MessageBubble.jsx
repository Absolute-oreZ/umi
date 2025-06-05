import { GiRamProfile } from "react-icons/gi";
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from "react-icons/io5";
import { TbFileTypeDocx, TbFileTypePdf } from "react-icons/tb";
import {
  formatTimestampToTime,
  formatImagePath,
  getFileNameFromPath,
} from "../../utils";

const MessageBubble = ({
  message,
  isSelfMessage,
  isFirstMessage,
  handleShowProfile,
}) => {
  const {
    content,
    messageStatus,
    messageType,
    senderProfilePicturePath,
    mediaPath,
    createdDate,
  } = message;

  const mentionRegex = /(@\w+)/g;

  const highlightMentions = (text) => {
    if (typeof text !== "string") {
      return text;
    }

    const parts = text.split(mentionRegex);
    return parts.map((part, idx) =>
      mentionRegex.test(part) ? (
        <span
          onClick={() => handleShowProfile(part)}
          key={idx}
          className="text-cyan-400 font-semibold hover:cursor-pointer"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const formattedProfilePath =
    isFirstMessage && senderProfilePicturePath
      ? formatImagePath(senderProfilePicturePath)
      : null;

  const formattedMediaPath = mediaPath ? formatImagePath(mediaPath) : null;

  return (
    <div
      className={`flex items-start w-full text-xs ${
        isSelfMessage ? "justify-end" : "justify-start"
      }`}
    >
      {messageType === "NOTICE" ? (
        <div className="mx-auto my-2 px-4 py-1 text-sm text-white bg-white/5 rounded-md backdrop-blur-sm shadow-sm">
          {typeof content === "string" ? (
            <>
              <span className="text-amber-300">{content.substring(0, 3)}</span>
              <span>{content.substring(3)}</span>
            </>
          ) : (
            <>{content}</>
          )}
        </div>
      ) : (
        <div
          className={`flex items-end gap-2 ${
            isSelfMessage ? "flex-row-reverse" : ""
          }`}
        >
          {isFirstMessage && (
            <div className="w-10 h-10 flex place-self-start mt-2">
              {formattedProfilePath ? (
                <img
                  src={formattedProfilePath}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <GiRamProfile className="text-white text-xl" />
                </div>
              )}
            </div>
          )}

          <div
            className={`message-bubble ${
              isSelfMessage ? "message-bubble-self" : "message-bubble-other"
            } ${!isFirstMessage ? "no-tail" : ""}`}
          >
            {messageType === "TEXT" && (
              <div className="bubble-content">
                {/* Use highlightMentions to render the content */}
                <p className="message-text">{highlightMentions(content)}</p>
                <span className="bubble-meta">
                  {formatTimestampToTime(createdDate)}
                  {isSelfMessage &&
                    (messageStatus === "SEEN" ? (
                      <IoCheckmarkDoneOutline className="check-icon seen" />
                    ) : (
                      <IoCheckmarkOutline className="check-icon" />
                    ))}
                </span>
              </div>
            )}
            {messageType === "IMAGE" && formattedMediaPath && (
              <img
                src={formattedMediaPath}
                alt="Media"
                className="chat-image"
              />
            )}
            {messageType === "PDF" && formattedMediaPath && (
              <div className="flex flex-col bg-purple-400 rounded-md py-3 px-4 gap-2 items-center justify-center max-w-[80%] md:max-w-[250px]">
                <div className="flex border-b border-white/50 p-3 gap-2 w-full">
                  <TbFileTypePdf className="w-8 h-8 flex-shrink-0" />
                  <div className="min-w-0 overflow-hidden">
                    <p className="truncate text-sm font-medium">
                      {getFileNameFromPath(message.mediaPath)}
                    </p>
                    <p className="text-xs opacity-75">PDF File</p>
                  </div>
                </div>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={formattedMediaPath}
                  className="p-2 rounded-md shadow-sm w-full text-center bg-purple-500 hover:bg-purple-600 transition-colors text-xs"
                >
                  Download
                </a>
              </div>
            )}
            {messageType === "DOCX" && formattedMediaPath && (
              <div className="flex flex-col bg-purple-400 rounded-md py-3 px-4 gap-2 items-center justify-center max-w-[80%] md:max-w-[250px]">
                <div className="flex border-b border-white/50 p-3 gap-2 w-full">
                  <TbFileTypeDocx className="w-8 h-8 flex-shrink-0" />
                  <div className="min-w-0 overflow-hidden">
                    <p className="truncate text-sm font-medium">
                      {getFileNameFromPath(message.mediaPath)}
                    </p>
                    <p className="text-xs opacity-75">Word Document</p>
                  </div>
                </div>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={formattedMediaPath}
                  className="p-2 rounded-md shadow-sm w-full text-center bg-purple-500 hover:bg-purple-600 transition-colors text-xs"
                >
                  Download
                </a>
              </div>
            )}
            {messageType === "AUDIO" && (
              <p className="font-extrabold">audio file</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
