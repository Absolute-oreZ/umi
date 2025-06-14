import { useState, useRef, useEffect, useCallback } from "react";
import ReactStringReplace from "react-string-replace";
import { MdOutlineAdd } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import { LiaSearchSolid } from "react-icons/lia";
import { customFetch } from "../../../api/fetchInstance";
import NewGroupContainer from "../../../components/group/NewGroupContainer";
import GroupCard from "../../../components/group/GroupCard";
import DetailsCard from "../../../components/common/DetailsCard";
import { useAuth } from "../../../context/AuthContext";
import { GroupsSkeleton } from "../../../skeletons";
import { useWebSocket } from "../../../context/WebSocketContext";
import MessageBubble from "../../../components/group/MessageBubble";
import GroupHeader from "../../../components/group/GroupHeader";
import InputBar from "../../../components/group/InputBar";
import SearchMessageBar from "../../../components/group/SearchMessageBar";
import { MessageListSkeleton } from "../../../skeletons";

const Groups = () => {
  const { user, isFetchingUserData } = useAuth();
  const {
    socket,
    currentGroups,
    messages,
    selectedGroup,
    othersRequests,
    currentUsersRequests,
    setCurrentGroups,
    setCurrentUsersRequests,
    setOthersRequests,
    subscribeToGroup,
    handleMessageSent,
    recommendedGroups,
    isFetchingGroups,
    isFetchingMessages,
    handleSelectGroup,
  } = useWebSocket();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isProfileCardVisible, setIsProfileCardVisible] = useState(false);
  const [isGroupCardVisible, setIsGroupCardVisible] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedMessageIndexes, setMatchedMessageIndexes] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [anotherProfile, setAnotherProfile] = useState(null);
  const [commonGroups, setCommonGroups] = useState(null);
  const [loadedMediaCount, setLoadedMediaCount] = useState(0); // Track loaded media

  const messagesEndRef = useRef(null);
  const messageRefs = useRef([]);

  const toggleForm = () => setIsFormVisible((prev) => !prev);
  const toggleProfileCard = () => setIsProfileCardVisible((prev) => !prev);
  const toggleGroupCard = () => setIsGroupCardVisible((prev) => !prev);
  const toggleSearchBar = () => {
    setShowSearchBar((prev) => !prev);
    setSearchQuery("");
    setMatchedMessageIndexes([]);
    setCurrentMatchIndex(0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMediaLoad = useCallback(() => {
    setLoadedMediaCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadedMediaCount]);

  useEffect(() => {
    if (!searchQuery) {
      setMatchedMessageIndexes([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches = messages.reduce((acc, msg, index) => {
      if (
        typeof msg.content === "string" &&
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        acc.push(index);
      }
      return acc;
    }, []);
    setMatchedMessageIndexes(matches);
    setCurrentMatchIndex(0);
  }, [searchQuery, messages]);

  useEffect(() => {
    if (matchedMessageIndexes.length > 0) {
      const idx = matchedMessageIndexes[currentMatchIndex];
      const node = messageRefs.current[idx];
      if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMatchIndex, matchedMessageIndexes]);

  const handleNextMatch = () => {
    if (matchedMessageIndexes.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchedMessageIndexes.length);
  };

  const handlePrevMatch = () => {
    if (matchedMessageIndexes.length === 0) return;
    setCurrentMatchIndex(
      (prev) =>
        (prev - 1 + matchedMessageIndexes.length) % matchedMessageIndexes.length
    );
  };

  const handleCreateGroup = async (formData) => {
    try {
      const response = await customFetch("/groups/new", {
        method: "POST",
        body: formData,
      });
      toggleForm();
      const data = await response.json();
      subscribeToGroup(socket, data);
      setCurrentGroups((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleAskToJoinGroup = async (groupId) => {
    try {
      const response = await customFetch(`/groups/join/${groupId}`, {
        method: "PATCH",
      });
      const data = await response.json();
      setCurrentUsersRequests((prev) => [...prev, data]);
      toggleForm();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleCancelJoinGroup = async (requestId) => {
    try {
      await customFetch(`/groups/cancel/${requestId}`, { method: "PATCH" });
      setCurrentUsersRequests((prev) =>
        prev.filter((request) => request.requestId !== requestId)
      );
    } catch (error) {
      console.error("Error cancelling join request:", error);
    }
  };

  const handleJoinGroupRequest = async (action, requestId) => {
    try {
      await customFetch(`/groups/${action}/${requestId}`, { method: "PATCH" });
      setOthersRequests((prev) =>
        prev.filter((request) => request.requestId !== requestId)
      );
    } catch (error) {
      console.error("Error handling join request:", error);
    }
  };

  const handleShowProfile = async (username) => {
    username = username.replace("@", "");
    try {
      const profileResponse = await customFetch(`/users/profile/${username}`);
      const commonGroupsResponse = await customFetch(
        `/groups/common/${username}`
      );

      const profileData = await profileResponse.json();
      const commonGroupsData = await commonGroupsResponse.json();

      if (profileData) setAnotherProfile(profileData);
      if (commonGroupsData) setCommonGroups(commonGroupsData);
      toggleProfileCard();
    } catch (error) {
      console.error("Error showing profile:", error);
    }
  };

  if (isFetchingGroups || isFetchingUserData) return <GroupsSkeleton />;

  return (
    <div className="flex flex-1 w-full min-h-screen">
      {isFormVisible && (
        <NewGroupContainer
          toggleForm={toggleForm}
          isFormVisible={isFormVisible}
          handleAskToJoinGroup={handleAskToJoinGroup}
          handleCreateGroup={handleCreateGroup}
          recommendedgroups={recommendedGroups}
        />
      )}

      {isProfileCardVisible && (
        <DetailsCard
          user={anotherProfile}
          commonGroups={commonGroups}
          toggleCard={toggleProfileCard}
          isCardVisible={isProfileCardVisible}
        />
      )}

      {isGroupCardVisible && (
        <DetailsCard
          group={selectedGroup}
          toggleCard={toggleGroupCard}
          isCardVisible={isGroupCardVisible}
        />
      )}

      {showSearchBar && (
        <SearchMessageBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearchBar={showSearchBar}
          onClose={toggleSearchBar}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          currentMatchIndex={currentMatchIndex}
          matchedMessageIndexes={matchedMessageIndexes}
        />
      )}

      <div className="flex flex-col gap-4 border-r-1 border-black w-2/7 min-h-screen p-4">
        <div className="flex justify-between">
          <h3 className="text-lg">Groups</h3>
          <div className="flex items-center gap-3">
            <button
              className={"relative group hover:bg-gray-500 p-1 rounded-md"}
              onClick={toggleForm}
              disabled={currentGroups.length >= 3}
            >
              <MdOutlineAdd className="text-xl" />
              <span className="pointer-events-none absolute right-full bottom-0 mr-2 mb-1 z-10 w-max px-2 py-1 text-sm text-white bg-black rounded transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1">
                {currentGroups.length >= 3
                  ? "You can't create or join a group anymore"
                  : "Create or join a new group"}
              </span>
            </button>

            <button className="relative group cursor-pointer hover:bg-gray-500 p-1 rounded-md">
              <IoFilter className="text-xl" />
              <span className="pointer-events-none absolute right-full bottom-0 mr-2 mb-1 z-10 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300">
                Filter groups by
              </span>
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            className="appearance-none border-1 border-b-cyan-600 border-b-3 pl-10 border-gray-300 hover:border-gray-400 transition-colors rounded-md w-full py-2 px-3 text-light-200 leading-tight focus:outline-none focus:ring-purple-600 focus:border-purple-600 focus:shadow-outline"
            type="text"
            placeholder="Search for a group"
          />
          <div className="absolute left-3 inset-y-0 flex items-center">
            <LiaSearchSolid />
          </div>
        </div>

        {isFetchingGroups ? (
          <div className="flex flex-1 gap-3">
            <svg
              className="animate-spin mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Fetching groups...
          </div>
        ) : currentGroups.length == 0 ? (
          <div>
            <p className="text-center">Oh no, you are alone here...</p>
            <p className="text-center">
              Let's{" "}
              <span
                className="hover:cursor-pointer hover:text-purple-600 underline underline-offset-3"
                onClick={toggleForm}
              >
                create a group or join one
              </span>{" "}
              !
            </p>
          </div>
        ) : (
          <div>
            {currentGroups.map((group, index) => (
              <div
                key={index}
                onClick={() => handleSelectGroup(group)}
                className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 my-1 ${
                  selectedGroup && selectedGroup.id === group.id
                    ? "bg-gray-700"
                    : "bg-gray-800 hover:bg-gray-600"
                }`}
              >
                <GroupCard group={group} />
              </div>
            ))}
          </div>
        )}

        {(othersRequests.length > 0 || currentUsersRequests.length > 0) && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg">Requests Pending Appoval</h3>
            {othersRequests.length > 0 && (
              <div className="flex flex-col gap-4 my-2">
                <h5 className="text-md font-semibold">Others' Requests</h5>
                {othersRequests.map((r, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-700 border rounded-md shadow-sm hover:shadow-md transition-shadow gap-2"
                  >
                    <img src={r.requesUserProfilePicturePath} />
                    <div>
                      <button
                        className="font-medium text-rose-400 hover:underline hover:cursor-pointer"
                        onClick={() => handleShowProfile(r.requesttUsersername)}
                      >
                        {r.requestUserUsername}
                      </button>
                      <p className="text-sm text-gray-300">
                        is requesting to join your group:{" "}
                        <strong className="text-amber-100">
                          {r.groupName}
                        </strong>
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() =>
                          handleJoinGroupRequest("ACCEPT", r.requestId)
                        }
                        className="green-button px-3 py-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleJoinGroupRequest("REJECT", r.requestId)
                        }
                        className="red-button px-3 py-1"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentUsersRequests.length > 0 && (
              <div className="flex flex-col">
                <h5 className="text-md mb-1">Your requests</h5>
                {currentUsersRequests.map((r, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-center justify-between my-1 border-amber-50 shadow-[0_-0.1px_0_#000]"
                  >
                    <p className="text-sm text-gray-300">
                      You are requesting to join
                      <strong className="text-amber-100 block">
                        {r.groupName}
                      </strong>
                    </p>
                    <div className="relative group overflow-visible">
                      <button
                        onClick={() => handleCancelJoinGroup(r.requestId)}
                        className="requesting-button px-3 py-1 text-sm relative cursor-pointer overflow-hidden"
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>X
                      </button>

                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                        Cancel Request
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedGroup ? (
        <div className="flex flex-col w-full h-screen">
          <GroupHeader
            iconPath={selectedGroup.iconPath}
            name={selectedGroup.name}
            members={selectedGroup.members}
            handleHeaderClicked={toggleGroupCard}
            handleSearchButtonClicked={toggleSearchBar}
          />

          {isFetchingMessages ? (
            <MessageListSkeleton />
          ) : (
            <div className="chat-scroll-area flex-1 overflow-y-auto px-4 py-2 bg-chat-bg">
              {messages.map((message, index, arr) => {
                const isMatch = matchedMessageIndexes.includes(index);

                let content = message.content;

                if (isMatch && searchQuery) {
                  content = ReactStringReplace(
                    message.content,
                    new RegExp(`(${searchQuery})`, "gi"),
                    (match, i) => (
                      <span
                        key={i}
                        className="bg-yellow-600 font-semibold rounded"
                      >
                        {match}
                      </span>
                    )
                  );
                }

                return (
                  <div
                    key={index}
                    ref={(el) => (messageRefs.current[index] = el)}
                  >
                    <MessageBubble
                      message={{ ...message, content }}
                      isSelfMessage={message.senderUsername === user.username}
                      isFirstMessage={
                        index === 0 ||
                        message.senderUsername !==
                          arr[index - 1]?.senderUsername
                      }
                      handleShowProfile={handleShowProfile}
                      handleMediaLoad={handleMediaLoad} // Pass the callback
                    />
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          <InputBar
            groupId={selectedGroup.id}
            members={selectedGroup.members}
            handleMessageSent={handleMessageSent}
          />
        </div>
      ) : (
        <div className="h-screen w-full flex justify-center items-center text-center flex-col">
          <img
            draggable="false"
            className="w-[150px] h-[150px]"
            src="icons/logo.png"
            alt="logo"
          />
          <p className="text-center">UMI for All</p>
        </div>
      )}
    </div>
  );
};

export default Groups;
