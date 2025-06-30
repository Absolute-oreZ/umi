import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { toast, Zoom } from "react-toastify";
import { customFetch } from "../api/fetchInstance";
import MessageToast from "../components/common/MessageToast";
import { formatImagePath, moveToFirst } from "../utils";
import { useAuth } from "./AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const backendBaseurl = backendUrl.split("/api")[0];

const WebSocketContext = createContext();
export const useWebSocket = () => useContext(WebSocketContext);

const WebSocketProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, loading, fetchingUserData } = useAuth();

  const [socket, setSocket] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isFetchingGroups, setisFetchingGroups] = useState(false);
  const [othersRequests, setOthersRequests] = useState([]);
  const [currentUsersRequests, setCurrentUsersRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentGroups, setCurrentGroups] = useState([]);

  const currentGroupsRef = useRef([]);
  const selectedGroupRef = useRef(null);
  const userRef = useRef(null);
  const locationRef = useRef(location);

  useEffect(() => {
    currentGroupsRef.current = currentGroups;
  }, [currentGroups]);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const fetchGroups = async () => {
    try {
      setisFetchingGroups(true);
      const response = await customFetch("/groups");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      return [];
    } finally {
      setisFetchingGroups(false);
    }
  };

  const fetchGroup = async (groupId) => {
    try {
      setisFetchingGroups(true);
      const response = await customFetch(`/groups/${groupId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch group:", error);
      return {};
    } finally {
      setisFetchingGroups(false);
    }
  };

  const fetchJoinGrouprequest = async (requestId) => {
    try {
      setisFetchingGroups(true);
      const response = await customFetch(`/groups/request/${requestId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch join request:", error);
      return {};
    } finally {
      setisFetchingGroups(false);
    }
  };

  const fetcMessagesByGroups = async (groupId) => {
    try {
      setIsFetchingMessages(true);
      const response = await customFetch(`/messages/${groupId}/messages`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return [];
    } finally {
      setIsFetchingMessages(false);
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    if (group.noOfUnreadMessages > 0) {
      group.noOfUnreadMessages = 0;
      await customFetch(`/messages/${group.id}/seen`, {
        method: "PATCH",
      });
    }
    const fetchedMessages = await fetcMessagesByGroups(group.id);
    setMessages(fetchedMessages);
  };

  const handleToastMessageClick = async (message) => {
    const currLocation = locationRef.current.pathname;

    if (currLocation !== "/groups") {
      navigate("/groups");
      setTimeout(async () => {
        if (!message.actionType) {
          const currentSelected = selectedGroupRef.current;
          if (!currentSelected || currentSelected.id !== message.groupId) {
            const group = currentGroupsRef.current.find(
              (group) => group.id === message.groupId
            );
            if (group) {
              await handleSelectGroup(group);
            }
          }
        }
      }, 100);
    } else {
      if (!message.actionType) {
        const currentSelected = selectedGroupRef.current;
        if (!currentSelected || currentSelected.id !== message.groupId) {
          const group = currentGroupsRef.current.find(
            (group) => group.id === message.groupId
          );
          if (group) {
            await handleSelectGroup(group);
          }
        }
      }
    }
  };

  const handleMessage = async (message, client) => {
    const toastId = `${message.actionType || "message"}-${
      message.requestId || message.messageDTO?.id
    }`;

    if (message.actionType) {
      const actionType = message.actionType;

      if (actionType === "REQUEST_ACCEPTED") {
        const joinedGroup = await fetchGroup(message.groupId);
        setCurrentGroups((prev) => {
          const groupExists = prev.some((group) => group.id === joinedGroup.id);
          return groupExists ? prev : [...prev, joinedGroup];
        });
        const subscription = subscribeToGroup(client, joinedGroup);
        setSubscriptions((prev) => [...prev, subscription]);

        setCurrentUsersRequests((prev) =>
          prev.filter((request) => request.requestId !== message.requestId)
        );
      } else if (actionType === "REQUEST_REJECTED") {
        setCurrentUsersRequests((prev) =>
          prev.filter((request) => request.requestId !== message.requestId)
        );
      } else if (actionType === "REQUEST_CANCELED") {
        setOthersRequests((prev) =>
          prev.filter((request) => request.requestId !== message.requestId)
        );
      } else if (actionType === "NEW_REQUEST") {
        const newRequest = await fetchJoinGrouprequest(message.requestId);
        setOthersRequests((prev) => {
          const exists = prev.some(
            (request) => request.requestId === newRequest.requestId
          );
          return exists ? prev : [...prev, newRequest];
        });
      }

      if (!toast.isActive(toastId)) {
        toast(
          <MessageToast
            icon={formatImagePath(message.iconPath)}
            title={message.title}
            content={message.content}
            handleToastMessageClick={() => handleToastMessageClick(message)}
          />,
          {
            toastId,
            position: "bottom-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            closeButton: true,
            pauseOnHover: true,
            draggable: false,
            theme: "dark",
            transition: Zoom,
            className: "rounded-lg shadow p-3",
          }
        );
      }
    } else {
      const currentLocation = locationRef.current.pathname;
      const currentSelectedGroup = selectedGroupRef.current;
      const currentUser = userRef.current;

      setCurrentGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) =>
          group.id === message.groupId
            ? { ...group, lastMessage: message.messageDTO }
            : group
        );
        return moveToFirst(updatedGroups, (g) => g.id === message.groupId);
      });

      const isViewingThisGroupChat =
        currentLocation === "/groups" &&
        currentSelectedGroup &&
        currentSelectedGroup.id === message.groupId;

      if (isViewingThisGroupChat) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) => msg.id === message.messageDTO.id
          );
          return messageExists
            ? prevMessages
            : [...prevMessages, message.messageDTO];
        });
        try {
          await customFetch(`/messages/${currentSelectedGroup.id}/seen`, {
            method: "PATCH",
          });
        } catch (error) {
          console.error("📨 Failed to mark messages as seen:", error);
        }
      } else if (
        currentUser &&
        message.senderUsername !== currentUser.username
      ) {
        if (!toast.isActive(toastId)) {
          toast(
            <MessageToast
              icon={formatImagePath(message.iconPath)}
              title={message.title}
              content={message.content}
              handleToastMessageClick={() => handleToastMessageClick(message)}
            />,
            {
              toastId,
              position: "bottom-right",
              autoClose: 4000,
              hideProgressBar: true,
              closeOnClick: true,
              closeButton: true,
              pauseOnHover: true,
              draggable: false,
              theme: "dark",
              transition: Zoom,
              className: "rounded-lg shadow p-3",
            }
          );
        }
      }
    }
  };

  const handleMessageSent = async (content, media, messageType, groupId) => {
    try {
      const formData = new FormData();
      formData.append("groupId", groupId);
      formData.append("messageType", messageType);

      if (messageType === "TEXT") {
        formData.append("content", content);
      } else if (media) {
        formData.append("media", media);
      }

      await customFetch("/messages/new", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("📤 Error sending message:", error);
    }
  };

  const subscribeToGroup = (client, group) => {
    const topic = `/topic/group/${group.id}`;
    return client.subscribe(topic, (message) =>
      handleMessage(JSON.parse(message.body), client)
    );
  };

  const subscribeToGroups = (client, groups) => {
    const groupSubscriptions = groups.map((group) =>
      subscribeToGroup(client, group)
    );
    setSubscriptions((prev) => [...prev, ...groupSubscriptions]);
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      console.error("Invalid token structure", e);
      return null;
    }
  };

  const connectWebSocket = async () => {
    if (!session?.access_token) {
      setSubscriptions([]);
      setCurrentGroups([]);
      return;
    }

    console.log(session.access_token);

    const client = new Client({
      webSocketFactory: () => new SockJS(`${backendBaseurl}/ws`),
      connectHeaders: { Authorization: `Bearer ${session.access_token}` },
      reconnectDelay: 5000,
      debug: (str) => console.log("🔌 WebSocket:", str),
    });

    client.onConnect = async () => {
      const fetchedGroups = await fetchGroups();
      const {
        currentGroups = [],
        currentUsersRequests = [],
        othersRequests = [],
      } = fetchedGroups;

      setCurrentGroups(currentGroups);
      setCurrentUsersRequests(currentUsersRequests);
      setOthersRequests(othersRequests);

      subscribeToGroups(client, currentGroups);

      if (session?.access_token) {
        try {
          const tokenPayload = parseJwt(session.access_token);
          if (!tokenPayload) {
            throw new Error("Token parsing failed");
          }

          const userId = tokenPayload.sub;

          if (userId) {
            const userTopic = `/user/${userId}/notification`;
            client.subscribe(userTopic, (message) =>
              handleMessage(JSON.parse(message.body), client)
            );
            console.log("🔌 Subscribed to user topic:", userTopic);
          }
        } catch (error) {
          console.error("Token validation failed:", error);
        }
      }
    };

    client.onStompError = (frame) => {
      console.error("🔌 Broker reported error:", frame.headers["message"]);
      console.error("🔌 Details:", frame.body);
    };

    client.activate();
    setSocket(client);
  };

  useEffect(() => {
    if (!loading && session && user) {
      connectWebSocket();
    }

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
      if (socket) {
        socket.deactivate();
      }
    };
  }, [loading, fetchingUserData, user]);

  useEffect(() => {
    if (location.pathname !== "/groups") {
      setSelectedGroup(null);
      setMessages([]);
    }
  }, [location.pathname]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isFetchingMessages,
        isFetchingGroups,
        selectedGroup,
        othersRequests,
        currentUsersRequests,
        messages,
        currentGroups,
        subscriptions,
        handleSelectGroup,
        handleMessageSent,
        subscribeToGroup,
        setSubscriptions,
        setisFetchingGroups,
        setCurrentUsersRequests,
        setSelectedGroup,
        setCurrentGroups,
        setOthersRequests,
        setMessages,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
