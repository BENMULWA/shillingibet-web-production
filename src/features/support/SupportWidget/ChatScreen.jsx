import { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiSend, FiPaperclip } from "react-icons/fi";
import { BiSupport } from "react-icons/bi";
import { useChatContext } from "../../../context/ChatProvider";

export default function ChatScreen({ onBack }) {
  const {
    connected,
    messages,
    typingUsers,
    sendMessage,
    emitTyping,
    emitStopTyping,
  } = useChatContext();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSend = () => {
    if (!inputValue.trim() || !connected) return;
    sendMessage(inputValue.trim());
    setInputValue("");
    emitStopTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-screen">
      {/* Header */}
      <div className="chat-header">
        <button onClick={onBack} className="chat-back-btn">
          <FiArrowLeft size={18} />
        </button>
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            <BiSupport size={20} />
          </div>
          <div>
            <p className="chat-header-name">ShilingiBet Support</p>
            <div className="chat-header-status">
              <span className="chat-header-status-dot"></span>
              <span className="chat-header-status-text">
                {connected ? "Connected" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat-message ${message.senderType === "customer" ? "user" : "system"}`}
          >
            <div className="chat-message-bubble">
              <p className="chat-message-text">{message.content}</p>
              <p className="chat-message-time">{formatTime(message.createdAt)}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="chat-typing">
            <div className="chat-typing-bubble">
              <div className="chat-typing-dots">
                <span className="chat-typing-dot"></span>
                <span className="chat-typing-dot"></span>
                <span className="chat-typing-dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-wrapper">
        <div className="chat-input-container">
          <button className="chat-attach-btn">
            <FiPaperclip size={18} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              emitTyping();
            }}
            onBlur={emitStopTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !connected}
            className={`chat-send-btn ${inputValue.trim() ? "active" : "inactive"}`}
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
