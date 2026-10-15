import { ChevronLeftIcon } from "@/components/Icons";
import type { Conversation } from "./types";
import { Link } from "react-router-dom";

const ChatHeader = ({
  activeChat,
  setActiveChat,
}: {
  activeChat: Conversation;
  setActiveChat: (chat: Conversation | null) => void;
}) => {
  return (
    <header className="messages-chat-header">
      <div className="messages-chat-header-user">
        <button
          className="messages-icon-btn"
          onClick={() => setActiveChat(null)}
          title="Back"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <div
          className="conversation-avatar"
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: "50%",
          }}
        >
          <Link to={`/@${activeChat.username}`}>
            {activeChat.avatar ? (
              <img
                src={activeChat.avatar}
                alt={activeChat.name}
                className="conversation-avatar"
              />
            ) : (
              <span>{activeChat.name.charAt(0).toUpperCase()}</span>
            )}
          </Link>
        </div>
        <div>
          <Link to={`/@${activeChat.username}`}>
            <h3 style={{ fontSize: "15px", fontWeight: "600", margin: 0 }}>
              {activeChat.name}
            </h3>
          </Link>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            @{activeChat.username}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
