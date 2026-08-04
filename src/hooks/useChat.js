import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "";
const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL ||
  API_URL.replace(/\/api\/v1\/?$/, "") ||
  window.location.origin
).replace(/\/$/, "");

export function useChat(
  token,
  { enabled = true, topic = "general", mode = "community" } = {}
) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  // SOCKET CONNECT
  useEffect(() => {
    if (!token || !enabled) return;

    const cleanToken = token.replace("Bearer ", "");

    const namespace = mode === "support" ? "support-chat" : "community-chat";
    const newSocket = io(`${SOCKET_URL}/${namespace}`, {
      auth: { token: cleanToken, topic },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket error:", error.message);
    });

    newSocket.on("chat:history", (data) => {
      setCurrentUser(data.user);
      setMessages(data.messages);
      setActiveUsers(data.activeUsers);
    });

    newSocket.on("chat:new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("chat:user_joined", (data) => {
      setActiveUsers(data.activeUsers);
    });

    newSocket.on("chat:user_left", (data) => {
      setActiveUsers(data.activeUsers);
    });

    newSocket.on("chat:user_typing", (data) => {
      setTypingUsers((prev) =>
        prev.includes(data.username) ? prev : [...prev, data.username]
      );
    });

    newSocket.on("chat:user_stop_typing", (data) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.username));
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [token, enabled, topic, mode]);

  // SEND MESSAGE
  const sendMessage = useCallback(
    (content, replyTo = null) => {
      if (!socket || !content.trim()) return;

      socket.emit("chat:send_message", {
        content,
        messageType: "text",
        ...(replyTo && { replyTo }),
      });
    },
    [socket]
  );

  const emitTyping = useCallback(() => {
    socket?.emit("chat:typing");
  }, [socket]);

  const emitStopTyping = useCallback(() => {
    socket?.emit("chat:stop_typing");
  }, [socket]);

  return {
    connected,
    messages,
    activeUsers,
    currentUser,
    typingUsers,
    sendMessage,
    emitTyping,
    emitStopTyping,
    mode,
  };
}
