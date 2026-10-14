import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import {
  SearchIcon,
  CloseIcon,
  ChevronLeftIcon,
  ComposeIcon,
  DirectMessageIcon,
} from "@/components/Icons";
import "./messages.css";

// Interface for a conversation/contact
interface Conversation {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
}

// Interface for chat message
interface ChatMessage {
  id: string;
  senderId: string;
  username: string;
  message: string;
  timestamp: string;
}

const MessagesPage = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"inbox" | "requests">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecipientId, setNewRecipientId] = useState("");

  // Initial sample / test conversation (includes the recipient ID you were using)
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "cmv6rtnyz0000g3l4th4rbkwh",
      name: "Direct Contact",
      username: "spool_user",
      lastMessage: "Send a direct message to start chatting",
      time: "Now",
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  console.log("messagesEndRef", messagesEndRef);
  // Auto-scroll chat body
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Connect socket once
  useEffect(() => {
    if (!profile?._id) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: {
        id: profile._id,
      },
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("send-chat-message", (data: any) => {
      console.log("Received chat-message:", data);
      const incomingMsg: ChatMessage = {
        id: Date.now().toString() + Math.random().toString(),
        senderId: data.from || data.to,
        username: data.username || "User",
        message: data.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prev) => [...prev, incomingMsg]);

      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.from || c.id === data.to
            ? { ...c, lastMessage: data.message, time: "Just now" }
            : c,
        ),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [profile?._id]);

  // Handle sending message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChat || !profile?._id) return;

    const messageText = inputValue.trim();

    // 1. Emit to Socket.IO
    socketRef.current?.emit("chat-message", {
      to: activeChat.id,
      message: messageText,
      from: profile._id,
      username: profile.username || "You",
    });

    // 2. Append local message optimistically
    const myMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: profile._id,
      username: profile.username || "You",
      message: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, myMsg]);

    // Update conversation preview in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? { ...c, lastMessage: messageText, time: "Just now" }
          : c,
      ),
    );

    setInputValue("");
  };

  // Filter conversations
  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Start new conversation from modal
  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientId.trim()) return;

    const targetId = newRecipientId.trim();
    let target = conversations.find((c) => c.id === targetId);

    if (!target) {
      target = {
        id: targetId,
        name: `User ${targetId.slice(-4)}`,
        username: `user_${targetId.slice(-6)}`,
        lastMessage: "New conversation",
        time: "Now",
      };
      setConversations((prev) => [target!, ...prev]);
    }

    setActiveChat(target);
    setIsModalOpen(false);
    setNewRecipientId("");
  };

  return (
    <div className="messages-container">
      {/* ---------------- LEFT COLUMN: MESSAGES LIST ---------------- */}
      <aside
        className={`messages-sidebar ${activeChat ? "hidden-mobile" : ""}`}
      >
        {/* Header: Title + Compose button */}
        <div className="messages-sidebar-header">
          <h1 className="messages-sidebar-title">Messages</h1>
          <button
            className="messages-icon-btn"
            onClick={() => setIsModalOpen(true)}
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
              const isSelected = activeChat?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`conversation-item ${isSelected ? "active" : ""}`}
                  onClick={() => setActiveChat(item)}
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

      {/* ---------------- RIGHT COLUMN: CHAT / EMPTY STATE ---------------- */}
      <main
        className={`messages-main-pane ${!activeChat ? "hidden-mobile" : ""}`}
      >
        {!activeChat ? (
          /* Empty state matching the screenshot */
          <div className="messages-empty-container">
            <div className="messages-empty-circle">
              <DirectMessageIcon size={38} />
            </div>
            <h2 className="messages-empty-title">
              Keep it real in direct messages
            </h2>
            <p className="messages-empty-subtitle">
              Start a side conversation, send threads and more.
            </p>
            <button
              className="messages-new-btn"
              onClick={() => {
                if (conversations.length > 0) {
                  setActiveChat(conversations[0]);
                } else {
                  setIsModalOpen(true);
                }
              }}
            >
              New message
            </button>
          </div>
        ) : (
          /* Active Chat View */
          <>
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
                  style={{ width: 38, height: 38 }}
                >
                  <span>{activeChat.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3
                    style={{ fontSize: "15px", fontWeight: "600", margin: 0 }}
                  >
                    {activeChat.name}
                  </h3>
                  <span
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    @{activeChat.username}
                  </span>
                </div>
              </div>
            </header>

            {/* Chat Body */}
            <div className="messages-chat-body">
              {chatMessages.length === 0 ? (
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
                chatMessages.map((msg) => {
                  const isMine = msg.senderId === profile?._id;
                  return (
                    <div
                      key={msg.id}
                      className={`message-bubble-wrapper ${
                        isMine ? "mine" : "theirs"
                      }`}
                    >
                      <div
                        className={`message-bubble ${
                          isMine ? "mine" : "theirs"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="messages-input-bar">
              <form
                className="messages-input-form"
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  className="messages-input-field"
                  placeholder="Start a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="messages-send-btn"
                  disabled={!inputValue.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* ---------------- NEW MESSAGE MODAL ---------------- */}
      {isModalOpen && (
        <div
          className="new-msg-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="new-msg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="new-msg-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                New Message
              </h3>
              <button
                className="messages-icon-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <form className="new-msg-modal-body" onSubmit={handleStartNewChat}>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Recipient User ID / Username:
                </label>
                <input
                  type="text"
                  placeholder="e.g. cmv6rtnyz0000g3l4th4rbkwh"
                  value={newRecipientId}
                  onChange={(e) => setNewRecipientId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-main)",
                    outline: "none",
                    fontSize: "14px",
                  }}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="messages-new-btn"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={!newRecipientId.trim()}
              >
                Chat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
