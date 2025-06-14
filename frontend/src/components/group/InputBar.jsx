import { useState, useEffect, useRef, useMemo } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  MdOutlineEmojiEmotions,
  MdAttachFile,
  // MdMic, // ❌ Voice icon
  MdSend,
  MdDeleteForever,
} from "react-icons/md";
// import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder"; // ❌ Voice recorder
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import {
  TbFileTypeDocx,
  TbFileTypePdf,
  TbPlayerPlayFilled,
} from "react-icons/tb";
// import WaveSurfer from "wavesurfer.js"; // ❌ Waveform
import { useAuth } from "../../context/AuthContext";
import {
  formatAudioTime,
  formatImagePath,
  getMediaExtension,
  getMediaTypeFromExtension,
  getReadableFileSize,
  validateFileSize,
} from "../../utils";
import { toast, Slide } from "react-toastify";

const InputBar = ({ groupId, members, handleMessageSent }) => {
  // const recorderControls = useAudioRecorder();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [audioDuration, setAudioDuration] = useState(null); //
  const [mediaUrl, setMediaUrl] = useState("");
  const [messageType, setMessageType] = useState("TEXT");
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // const wavesurferRef = useRef(null);
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);
  const suggestionItemsRef = useRef([]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => m.username !== user.username);
  }, [members, user.username]);

  const hasMessage = message.trim().length > 0;
  const hasMedia = media !== null;
  const isRecording = false; // recorderControls.isRecording;
  const canAttachFile = !hasMessage && !hasMedia && !isRecording;
  const canSelectEmoji = !hasMedia && !isRecording;
  const canRecord = false; // !hasMessage && !hasMedia;
  const canType = !hasMedia && !isRecording;

  const handleEmojiSelect = (emoji) => {
    if (!canSelectEmoji) return;
    setMessage((prev) => prev + emoji.native);
  };

  // useEffect(() => {
  //   if (!media || messageType !== "AUDIO") return;
  //   const ws = WaveSurfer.create({
  //     container: wavesurferRef.current,
  //     waveColor: "#e5e7eb",
  //     progressColor: "#fb923c",
  //     url: mediaUrl,
  //     dragToSeek: true,
  //     width: "20vw",
  //     height: 30,
  //     hideScrollbar: true,
  //     normalize: true,
  //     barGap: 1,
  //     barHeight: 10,
  //     barRadius: 10,
  //     barWidth: 5,
  //     backend: "MediaElement",
  //   });
  //   wavesurferRef.current = ws;
  //   return () => {
  //     ws.destroy();
  //     wavesurferRef.current = null;
  //   };
  // }, [media, messageType, mediaUrl]);

  // useEffect(() => {
  //   const ws = wavesurferRef.current;
  //   if (!ws) return;
  //   const onReady = () => {
  //     setAudioDuration(ws.getDuration().toFixed(1));
  //   };
  //   ws.on("ready", onReady);
  //   return () => {
  //     ws.un("ready", onReady);
  //   };
  // }, [media]);

  useEffect(() => {
    if (mentionQuery !== null) {
      const results = filteredMembers.filter((m) =>
        m.username.toLowerCase().includes(mentionQuery.toLowerCase())
      );
      setSuggestions(results);
      setShowSuggestions(true);
      setHighlightedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [mentionQuery, filteredMembers]);

  useEffect(() => {
    if (showSuggestions && suggestionItemsRef.current[highlightedIndex]) {
      suggestionItemsRef.current[highlightedIndex].scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex, showSuggestions]);

  const handleChange = (e) => {
    if (!canType) return;
    const value = e.target.value;
    setMessage(value);
    const cursorPos = e.target.selectionStart;
    const textUntilCursor = value.slice(0, cursorPos);
    const mentionMatch = textUntilCursor.match(/@(\w*)?$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1] || "");
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (username) => {
    const cursorPos = textareaRef.current.selectionStart;
    const before = message
      .slice(0, cursorPos)
      .replace(/@(\w*)?$/, `@${username} `);
    const after = message.slice(cursorPos);
    const newMessage = before + after;
    setMessage(newMessage);
    setMentionQuery(null);
    setShowSuggestions(false);
    setTimeout(() => {
      textareaRef.current.focus();
    }, 0);
  };

  const handleFileChange = (e) => {
    if (!canAttachFile) return;
    const file = e.target.files[0];
    if (!file) return;
    setMessage("");
    const { isValid, message: errMsg } = validateFileSize(
      file,
      5 * 1024 * 1024
    );
    if (!isValid) {
      toast.error(errMsg, {
        position: "bottom-right",
        autoClose: 5000,
        theme: "dark",
        transition: Slide,
      });
      e.target.value = "";
      return;
    }
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
    }
    setMedia(file);
    const type = getMediaTypeFromExtension(file.name);
    setMessageType(type);
    if (type === "IMAGE") {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
    } else {
      setMediaUrl("");
    }
    e.target.value = "";
  };

  // const handleAudioRecordingComplete = (blob) => {
  //   if (isDiscarding) return;
  //   if (mediaUrl) {
  //     URL.revokeObjectURL(mediaUrl);
  //   }
  //   const url = URL.createObjectURL(blob);
  //   setMedia(blob);
  //   setMediaUrl(url);
  //   setMessageType("AUDIO");
  // };

  // const handlePlayPause = () => {
  //   if (wavesurferRef) {
  //     wavesurferRef.current.playPause();
  //   }
  // };

  const discardMedia = () => {
    setIsDiscarding(true);
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
    }
    // if (recorderControls.isRecording) {
    //   recorderControls.stopRecording();
    // }
    setMedia(null);
    setMediaUrl("");
    setMessageType("TEXT");
    setMessage("");
    setTimeout(() => {
      setIsDiscarding(false);
    }, 100);
  };

  const send = async () => {
    if (!groupId) return;
    if (hasMedia) {
      await handleMessageSent("", media, messageType, groupId);
      discardMedia();
    } else if (hasMessage) {
      await handleMessageSent(message, null, "TEXT", groupId);
      setMessage("");
    }
    setShowPicker(false);
  };

  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      } else if (e.key === "Enter" && !e.shiftKey) {
        if (suggestions[highlightedIndex]) {
          e.preventDefault();
          handleSelectMention(suggestions[highlightedIndex].username);
          return;
        }
      }
    }

    if (e.key === "Enter" && !e.shiftKey && (hasMessage || hasMedia)) {
      e.preventDefault();
      send();
    }
  };

  const getHighlightedText = (text) => {
    return text.split(/(@[\w-]+)/g).map((part, idx) => {
      if (part.startsWith("@")) {
        return (
          <span key={idx} className="text-cyan-400 font-semibold">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const showMediaPreview = () => {
    if (!media) return null;
    if (messageType === "IMAGE") {
      return (
        <img
          src={mediaUrl}
          alt="uploaded"
          className="w-32 h-32 object-cover rounded"
        />
      );
    }
    // if (messageType === "AUDIO") {
    //   return (
    //     <div className="w-32 h-32 flex items-center justify-center bg-gray-500 rounded-md">
    //       <MdMic className="w-16 h-16 text-gray-300" />
    //     </div>
    //   );
    // }
    if (messageType === "DOCX") {
      return <TbFileTypeDocx className="w-32 h-32" />;
    }
    if (messageType === "PDF") {
      return <TbFileTypePdf className="w-32 h-32" />;
    }
    return null;
  };

  return (
    <div className="relative">
      {showPicker && canSelectEmoji && (
        <div className="absolute bottom-full mb-2 left-2 z-50">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="dark"
            locale="en"
          />
        </div>
      )}

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-16 left-4 bg-gray-600 shadow-md rounded-md w-64 z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            suggestions.map((member, index) => (
              <div
                key={member.id}
                ref={(el) => (suggestionItemsRef.current[index] = el)}
                className={`flex items-center gap-2 p-2 cursor-pointer ${
                  index === highlightedIndex
                    ? "bg-gray-500 text-amber-400"
                    : "text-amber-200 hover:bg-gray-500"
                }`}
                onClick={() => handleSelectMention(member.username)}
              >
                <img
                  src={formatImagePath(member.profilePicturePath)}
                  alt={member.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span>@{member.username}</span>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-400">No matches</div>
          )}
        </div>
      )}

      {hasMedia && (
        <div className="absolute justify-center items-center flex flex-col bottom-16 left-4 bg-gray-600 shadow-md rounded-md gap-2 w-110 h-70 p-3">
          {showMediaPreview()}
          <div className="max-w-xs mt-1 text-sm text-gray-300 truncate">
            {media.name || "Media File"}
          </div>
          {messageType !== "AUDIO" && (
            <p>
              {getReadableFileSize(media)},{" "}
              {getMediaExtension(media.name).toUpperCase()}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 py-1 px-3 border-t border-gray-700 bg-gray-800 relative justify-between">
        <div
          className={`flex items-center gap-1 ${
            !canSelectEmoji ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <button
            onClick={() => setShowPicker((prev) => !prev)}
            disabled={!canSelectEmoji}
            className="hover:bg-gray-700 p-2 rounded"
          >
            <MdOutlineEmojiEmotions className="w-6 h-6 text-gray-300" />
          </button>

          <label
            htmlFor="file-upload"
            className={`hover:bg-gray-700 p-2 rounded cursor-pointer ${
              !canAttachFile ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <MdAttachFile className="w-6 h-6 text-gray-300" />
            <input
              id="file-upload"
              type="file"
              accept="image/*,.pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
              disabled={!canAttachFile}
            />
          </label>
        </div>

        <div className="relative flex-1">
          <div className="absolute top-0 left-0 right-0 bottom-0 px-4 py-2 whitespace-pre-wrap break-words pointer-events-none text-white opacity-70">
            {getHighlightedText(message)}
          </div>
          {message.length === 0 && (
            <div className="absolute top-0 left-0 px-4 py-2 text-gray-500 pointer-events-none select-none">
              Type a message
            </div>
          )}
          <TextareaAutosize
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={!canType}
            rows={1}
            placeholder=""
            className="w-full resize-none bg-transparent text-white rounded-3xl px-4 py-2 outline-none relative z-10"
            style={{
              caretColor: "white",
              color: "transparent",
              backgroundColor: "transparent",
            }}
          />
        </div>

        {hasMedia && (
          <button
            onClick={discardMedia}
            className="p-2 flex items-center justify-center rounded-md w-10 h-10 text-red-600 hover:text-white hover:bg-red-600"
          >
            <MdDeleteForever />
          </button>
        )}

        <button
          onClick={send}
          className="p-2 flex items-center justify-center rounded-md w-10 h-10 text-purple-400 hover:text-white hover:bg-purple-400"
        >
          <MdSend />
        </button>

        {/* AudioRecorder removed */}
      </div>
    </div>
  );
};

export default InputBar;
