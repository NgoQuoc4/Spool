import { ComposeIcon, SearchIcon, TrashIcon } from "@/components/Icons";
import React, { useState } from "react";
import type { Conversation } from "./types";
interface ConversationSidebarProps {
  conversations: Conversation[];
  activeChat: Conversation | null;
  onSelectChat: (chat: Conversation) => void;
  onDeleteChat: (e: React.MouseEvent, userId: string) => void;
  onOpenNewModal: () => void;
}
const ConversationSidebar = ({
  conversations,
  activeChat,
  onSelectChat,
  onDeleteChat,
  onOpenNewModal,
}: ConversationSidebarProps) => {
  const [activeTab, setActiveTab] = useState<"inbox" | "requests">("inbox");

  /////////////////////////////////////////
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className={`messages-sidebar ${activeChat ? "hidden-mobile" : ""}`}>
      {/* Header: Title + Compose button */}
      <div className="messages-sidebar-header">
        <h1 className="messages-sidebar-title">Messages</h1>
        <button
          className="messages-icon-btn"
          onClick={() => onOpenNewModal()}
          title="New message"
          aria-label="New message"
        >
          <ComposeIcon size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="messages-search-wrapper">
        <div className="messages-search-bar">
          <SearchIcon size={16} />
          <input
            type="text"
            className="messages-search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs: Inbox / Requests */}
      <div className="messages-tabs">
        <button
          type="button"
          className={`messages-tab-pill ${
            activeTab === "inbox" ? "active" : "inactive"
          }`}
          onClick={() => setActiveTab("inbox")}
        >
          Inbox
        </button>
        <button
          type="button"
          className={`messages-tab-pill ${
            activeTab === "requests" ? "active" : "inactive"
          }`}
          onClick={() => setActiveTab("requests")}
        >
          Requests
        </button>
      </div>

      {/* Conversation List */}
      <div className="messages-conversations-list">
        {activeTab === "requests" ? (
          <div className="conversation-empty-state">
            <p>No message requests</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((item) => {
            const itemId = item.userId;
            const activeId = activeChat?.userId;
            const isSelected = Boolean(activeId && itemId && activeId === itemId);
            return (
              <div
                key={itemId || item.username}
                className={`conversation-item ${isSelected ? "active" : ""}`}
                onClick={() => onSelectChat(item)}
              >
                <div className="conversation-avatar">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="conversation-avatar"
                    />
                  ) : (
                    <span>{item.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name-row">
                    <span className="conversation-name">{item.name}</span>
                    <span className="conversation-time">{item.time}</span>
                  </div>
                  <p className="conversation-last-msg">{item.lastMessage}</p>
                </div>
                <button
                  type="button"
                  className="conversation-delete-btn"
                  onClick={(e) =>
                    onDeleteChat(e, item.userId || "")
                  }
                  title="Delete conversation"
                  aria-label="Delete conversation"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="conversation-empty-state">
            <p>No messages found</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ConversationSidebar;
