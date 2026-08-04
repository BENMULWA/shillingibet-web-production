import { ChatProvider } from "../../context/ChatProvider";
import ChatSidebar from "./ChatSidebar/ChatSidebar";

export default function ChatPanel({
  token,
  open,
  collapsed,
  onClose,
  onToggleCollapse,
  topic,
  mode,
}) {
  return (
    <ChatProvider token={token} enabled={open} topic={topic} mode={mode}>
      <ChatSidebar
        open={open}
        onClose={onClose}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </ChatProvider>
  );
}
