import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { BiSupport } from "react-icons/bi";
import BottomNav from "./BottomNav";
import HomeScreen from "./HomeScreen";
import MessagesScreen from "./MessagesScreen";
import HelpScreen from "./HelpScreen";
import ChatScreen from "./ChatScreen";
import { ChatProvider } from "../../../context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import "./SupportWidget.css";

export default function SupportWidget({ token }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showChat, setShowChat] = useState(false);
  const [topic, setTopic] = useState("general");

  useEffect(() => {
    const openWidget = (event) => {
      setTopic(event?.detail?.topic || "general");
      setShowChat(false);
      setIsOpen(true);
    };
    window.addEventListener("open-support-chat", openWidget);
    return () => window.removeEventListener("open-support-chat", openWidget);
  }, []);

  useEffect(() => {
    if (!isOpen || window.innerWidth >= 768) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleStartChat = () => {
    if (!token) {
      setIsOpen(false);
      navigate("/login");
      return;
    }
    setShowChat(true);
  };

  const handleBackFromChat = () => {
    setShowChat(false);
  };

  return createPortal(
    <>
      {/* Floating Support Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`support-fab ${isOpen ? "open" : ""}`}
      >
        {isOpen ? (
          <FiX size={24} className="support-fab-icon" />
        ) : (
          <BiSupport size={26} className="support-fab-icon" />
        )}
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div className="support-panel-wrapper">
          <div className="support-panel">
            {/* Close button inside panel */}
            <button
              onClick={() => setIsOpen(false)}
              className="support-close-btn"
            >
              <FiX size={16} />
            </button>

            {showChat ? (
              <ChatProvider token={token} enabled={showChat} topic={topic} mode="support">
                <ChatScreen onBack={handleBackFromChat} />
              </ChatProvider>
            ) : (
              <>
                <div className="support-content">
                  {activeTab === "home" && (
                    <HomeScreen onStartChat={handleStartChat} />
                  )}
                  {activeTab === "messages" && (
                    <MessagesScreen onStartChat={handleStartChat} />
                  )}
                  {activeTab === "help" && <HelpScreen />}
                </div>
                <BottomNav active={activeTab} setActive={setActiveTab} />
              </>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
