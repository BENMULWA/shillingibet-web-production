import { lazy, Suspense, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import BottomNav from "../layouts/BottomNav";
import DownloadBanner from "../components/DownloadBanner";
import Sidebar from "../layouts/Sidebar";
import HomePage from "../pages/HomePage";

const AppDownloadPopup = lazy(() => import("../components/AppDownloadPopup"));
const FloatingActions = lazy(() => import("../components/FloatingActions"));
const ChatPanel = lazy(() => import("../features/chat/ChatPanel"));

function DashboardLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const chatWidth = chatCollapsed ? 320 : 380;
  const isSomethingOpen = showSidebar || isAppModalOpen || showChat;

  const closeAll = () => {
    setShowSidebar(false);
    setIsAppModalOpen(false);
    setShowChat(false);
  };

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) setCollapsed(true);
      if (window.innerWidth >= 1024) setCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const openSupportChat = () => setShowChat(true);
    window.addEventListener("open-support-chat", openSupportChat);
    return () => window.removeEventListener("open-support-chat", openSupportChat);
  }, []);

  // Show popup once on first visit
  useEffect(() => {
    const seen = localStorage.getItem("seenAppPopup");
    if (!seen) {
      setIsAppModalOpen(true);
      localStorage.setItem("seenAppPopup", "true");
    }
  }, []);

  // Lock body scroll when overlays are open
  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = isSomethingOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, isSomethingOpen]);

  const cleanToken = user?.token?.replace("Bearer ", "");
  const isAuthOverlayRoute = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset",
    "/verify",
  ].includes(location.pathname);

  return (
    <div
      className="betting-table-bg flex flex-col h-screen text-textColor no-scrollbar transition-all duration-300"
      style={{ marginRight: showChat && !isMobile ? `${chatWidth}px` : "0px" }}
    >
      <DownloadBanner />
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} isMobile={isMobile} onMenuClick={() => setShowSidebar(true)} />

      <div className="relative z-[1] flex flex-1 overflow-hidden no-scrollbar md:gap-2 lg:gap-2 pt-4 px-2 md:px-2">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <main className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(11,20,14,0.88),rgba(3,5,4,0.94))] pb-12 md:pb-0 appscroll no-scrollbar rounded-xl border border-white/5 backdrop-blur-[1px]">
          <div className="max-w-[3000px] mx-auto w-full lg:px-4 2xl:px-8">
            {isAuthOverlayRoute && <HomePage />}
            <Outlet />
          </div>
        </main>
      </div>

      {isMobile && (
        <BottomNav
          onMenuClick={() => setShowSidebar(true)}
          onChatClick={() => setShowChat((prev) => !prev)}
          closeAll={closeAll}
          isSomethingOpen={isSomethingOpen}
        />
      )}

      {isAppModalOpen && (
        <Suspense fallback={null}>
          <AppDownloadPopup isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <FloatingActions onOpenChat={() => setShowChat(true)} />
      </Suspense>

      {showChat && (
        <Suspense fallback={null}>
          <ChatPanel
            token={cleanToken}
            open={showChat}
            onClose={() => setShowChat(false)}
            collapsed={chatCollapsed}
            onToggleCollapse={() => setChatCollapsed((prev) => !prev)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default DashboardLayout;
