import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import type { ChatMessage } from "./types";
interface MessageListProps {
  messages: ChatMessage[];
  isLoadingMore: boolean;
  onScroll: () => void;
  chatBodyRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}
const ChatMessages = ({
  messages,
  isLoadingMore,
  onScroll,
  messagesEndRef,
  chatBodyRef,
}: MessageListProps) => {
  const { profile } = useAuth();
  return (
    <div className="messages-chat-body" ref={chatBodyRef} onScroll={onScroll}>
      {isLoadingMore && (
        <div
          style={{
            textAlign: "center",
            padding: "8px 0",
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          Đang tải tin nhắn cũ hơn...
        </div>
      )}
      {messages.length === 0 ? (
        <div
          style={{
            margin: "auto",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          <p>Send a message to start the conversation</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMine = msg.senderId === profile?._id;
          return (
            <div
              key={msg.id}
              className={`message-bubble-wrapper ${isMine ? "mine" : "theirs"}`}
            >
              <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
                {msg.message}
              </div>
              <span className="message-time">{msg.timestamp}</span>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
