import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  SearchIcon,
  CloseIcon,
  ChevronLeftIcon,
  ComposeIcon,
  DirectMessageIcon,
} from "@/components/Icons";
import "./messages.css";
import { usersApi } from "@/apis/users.api";

// ============================================================
// FIX NOTE (stale closure):
//   activeChatRef được khai báo ở component level và đồng bộ
//   với state activeChat qua useEffect. Socket callback là closure
//   bất đồng bộ — nếu đọc state trực tiếp bên trong socket.on()
//   sẽ luôn thấy giá trị lúc socket connect (thường null).
//   Ref thì luôn trỏ đến giá trị mới nhất.
// ============================================================

// Kiểu dữ liệu cho một cuộc hội thoại (contact) trong sidebar
interface Conversation {
  followed_user_id: string; // ID trong bảng follow (dùng để nhận diện từ socket)
  user_id: string; // ID thực của người đối diện (dùng để gọi API)
  name: string;
  username: string;
  avatar?: string;
  lastMessage?: string; // Tin nhắn gần nhất hiển thị ở sidebar
  time?: string; // Thời gian của tin nhắn gần nhất
}

// Kiểu dữ liệu cho một tin nhắn trong khung chat
interface ChatMessage {
  id: string;
  senderId: string; // ID người gửi (phân biệt tin nhắn của mình vs người kia)
  username?: string;
  message: string;
  timestamp: string; // Thời gian dạng "HH:MM"
}

const MessagesPage = () => {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"inbox" | "requests">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecipientId, setNewRecipientId] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(true); // Còn tin nhắn cũ để tải?
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Đang tải thêm?

  // ── Refs ──────────────────────────────────────────────────
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Anchor để cuộn xuống cuối
  const chatBodyRef = useRef<HTMLDivElement>(null); // Detect scroll lên đầu
  const messageInputRef = useRef<HTMLInputElement>(null); // Ref input chat để focus dễ dàng

  // FIX (stale closure): Ref đồng bộ với activeChat để dùng bên trong socket callback.
  // Nếu đọc state activeChat trực tiếp trong socket.on() sẽ bị "đóng băng" ở giá trị
  // lúc socket kết nối. Ref luôn trỏ đến giá trị mới nhất.
  const activeChatRef = useRef<Conversation | null>(null);

  // Danh sách cuộc hội thoại — khởi tạo rỗng, không có phần tử giả
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Đồng bộ ref mỗi khi activeChat thay đổi
  useEffect(() => {
    activeChatRef.current = activeChat;
    //focus input khi chuyển
    messageInputRef.current?.focus();
  }, [activeChat]);

  // ============================================================
  // BƯỚC 1: Lấy danh sách người trò chuyện từ lịch sử tin nhắn
  // Không phụ thuộc vào following list — bất kỳ ai đã nhắn tin đều hiện
  // ============================================================
  useEffect(() => {
    if (!profile?._id) return;
    const fetchConversations = async () => {
      try {
        const response = await usersApi.getConversations();
        const contacts = response.data.result.map((item: any) => ({
          // followed_user_id = user_id vì contact này đến từ lịch sử tin nhắn
          followed_user_id: item.user_id,
          user_id: item.user_id,
          name: item.name,
          username: item.username,
          avatar: item.avatar,
          lastMessage: item.lastMessage,
          time: item.lastMessageAt
            ? new Date(item.lastMessageAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        }));

        // Giữ lại những người chưa có tin nhắn trong DB nhưng đang được mở tạm thời (từ ProfilePage hoặc modal)
        setConversations((prev) => {
          const unsaved = prev.filter(
            (p) => !contacts.some((c: any) => c.user_id === p.user_id),
          );
          return [...unsaved, ...contacts];
        });

        // Đồng bộ lại activeChat với thông tin chi tiết từ DB (nếu có)
        setActiveChat((current) => {
          if (!current) return current;
          const match = contacts.find(
            (c: any) => c.user_id === current.user_id,
          );
          return match ? { ...current, ...match } : current;
        });
      } catch (error) {
        console.error("Lỗi tải danh sách hội thoại:", error);
      }
    };
    fetchConversations();
  }, [profile?._id]); // Chỉ chạy lại nếu profile thay đổi

  // ============================================================
  // BƯỚC 1b: Xử lý deep-link từ ProfilePage (?userId=<id>)
  // Khi user bấm "Message" trên trang profile, URL sẽ có ?userId=<id>
  // → tự động mở chat với người đó, rồi xóa query param khỏi URL
  // ============================================================
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (!targetUserId || !profile?._id || targetUserId === profile._id) return;

    const contactName = searchParams.get("name") || "User";
    const contactUsername = searchParams.get("username") || "";
    const contactAvatar = searchParams.get("avatar") || "";

    const targetContact: Conversation = {
      followed_user_id: targetUserId,
      user_id: targetUserId,
      name: contactName,
      username: contactUsername,
      avatar: contactAvatar,
    };

    setConversations((prev) => {
      const existing = prev.find((c) => c.user_id === targetUserId);
      if (existing) {
        return [existing, ...prev.filter((c) => c.user_id !== targetUserId)];
      }
      return [targetContact, ...prev];
    });

    setActiveChat((current) => {
      if (current?.user_id === targetUserId) return current;
      return targetContact;
    });

    setSearchParams({}, { replace: true }); // Xóa ?userId khỏi URL để URL gọn gàng
  }, [searchParams, profile?._id, setSearchParams]);

  // Helper: cuộn xuống cuối khung chat
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Helper: chuyển đổi format tin nhắn từ backend → ChatMessage
  const formatMessage = (m: any): ChatMessage => ({
    id: m.id,
    senderId: m.sender_id,
    message: m.content,
    timestamp: new Date(m.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  // ============================================================
  // BƯỚC 2: Tải lịch sử tin nhắn khi chọn một cuộc hội thoại
  // Mỗi lần click vào contact khác → xóa tin cũ, tải 50 tin mới nhất
  // ============================================================
  useEffect(() => {
    if (!activeChat?.user_id) return;

    const fetchInitialMessages = async () => {
      try {
        setChatMessages([]);
        setHasMore(true);

        const response = await usersApi.getMessages(activeChat.user_id, {
          limit: 50,
        });

        const messages = response.data.result.map(formatMessage);
        setChatMessages(messages);

        if (messages.length < 50) {
          setHasMore(false);
        }

        setTimeout(() => {
          scrollToBottom("auto");
        }, 50);
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      }
    };

    fetchInitialMessages();
  }, [activeChat?.user_id]); // Chỉ chạy lại khi chọn người khác

  // ============================================================
  // BƯỚC 3: Tải thêm tin nhắn cũ khi cuộn lên đầu (Cursor-based pagination)
  // ============================================================
  // Cuộn lên đầu để tải thêm tin nhắn cũ hơn
  const handleScroll = async () => {
    const container = chatBodyRef.current;
    if (!container || !activeChat?.user_id || !hasMore || isLoadingMore) return;

    if (container.scrollTop === 0 && chatMessages.length > 0) {
      const oldestMessageId = chatMessages[0]?.id;
      if (!oldestMessageId) return;

      setIsLoadingMore(true);
      const prevScrollHeight = container.scrollHeight;

      try {
        const response = await usersApi.getMessages(activeChat.user_id, {
          limit: 50,
          cursor: oldestMessageId,
        });

        const olderMessages = response.data.result.map(formatMessage);

        if (olderMessages.length < 50) {
          setHasMore(false);
        }

        if (olderMessages.length > 0) {
          setChatMessages((prev) => [...olderMessages, ...prev]);

          // Giữ nguyên vị trí cuộn để không bị giật màn hình
          requestAnimationFrame(() => {
            if (chatBodyRef.current) {
              chatBodyRef.current.scrollTop =
                chatBodyRef.current.scrollHeight - prevScrollHeight;
            }
          });
        }
      } catch (error) {
        console.error("Lỗi tải thêm tin nhắn cũ:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // ============================================================
  // BƯỚC 4: Khởi tạo kết nối Socket.IO (realtime)
  // Chỉ kết nối MỘT LẦN khi có profile._id.
  // KHÔNG thêm activeChat vào deps — nếu thêm, socket sẽ
  // disconnect/reconnect mỗi khi người dùng chọn contact khác.
  // ============================================================
  useEffect(() => {
    if (!profile?._id) return;

    // Kết nối với thông tin xác thực của user hiện tại
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { id: profile._id },
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    // Nhận tin nhắn đến từ người khác
    socket.on("receive-chat-message", (data: any) => {
      // FIX: Dùng activeChatRef.current (KHÔNG dùng state activeChat trực tiếp)
      // vì callback này là closure — state sẽ bị "đóng băng" ở lúc socket.on() đăng ký.
      if (activeChatRef.current?.user_id === data.from) {
        // Người gửi đang là người mình đang chat → thêm vào khung chat
        const incomingMsg: ChatMessage = {
          id: Date.now().toString() + Math.random().toString(),
          senderId: data.from,
          username: data.username || "User",
          message: data.message,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prev) => [...prev, incomingMsg]);
        setTimeout(() => scrollToBottom("smooth"), 50);
      }

      // Dù đang chat với ai, cũng cập nhật lastMessage ở sidebar
      setConversations((prev) =>
        prev.map((c) =>
          c.followed_user_id === data.from
            ? { ...c, lastMessage: data.message, time: "Vừa xong" }
            : c,
        ),
      );
    });

    // Cleanup: ngắt kết nối khi component unmount để tránh rò rỉ
    return () => {
      socket.disconnect();
    };
  }, [profile?._id]); // Chỉ phụ thuộc vào profile._id

  // ============================================================
  // HANDLER: Gửi tin nhắn
  // 1. Emit qua Socket  2. Optimistic update (thêm ngay vào UI)
  // ============================================================
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !activeChat || !profile?._id) return;

    const messageText = inputValue.trim();

    // gửi tin nhắn tới user khác qua event "chat-message"
    // 1. Emit to Socket.IO
    // 1. Emit sự kiện qua Socket.IO để server relay đến người nhận
    socketRef.current?.emit("send-chat-message", {
      to: activeChat.user_id, // ID người nhận
      message: messageText,
      from: profile._id, // ID người gửi
      username: profile.username || "You",
    });

    // 2. Optimistic Update: thêm tin nhắn vào UI ngay, không đợi server xác nhận
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
    setTimeout(() => scrollToBottom("smooth"), 50);

    // Update conversation preview in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.followed_user_id === activeChat.followed_user_id ||
        c.user_id === activeChat.user_id
          ? { ...c, lastMessage: messageText, time: "Just now" }
          : c,
      ),
    );

    setInputValue("");
  };

  // ============================================================
  // COMPUTED: Lọc danh sách hội thoại theo từ khóa tìm kiếm
  // ============================================================
  const filteredConversations = conversations.filter((c) => {
    const result =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase());
    return result;
  });

  // ============================================================
  // HANDLER: Bắt đầu cuộc hội thoại mới từ modal
  // ============================================================
  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientId.trim() || !profile?._id) return;

    const targetId = newRecipientId.trim();
    let target = conversations.find(
      (c) => c.followed_user_id === targetId || c.user_id === targetId,
    );

    if (!target) {
      target = {
        followed_user_id: targetId,
        user_id: targetId, // FIX: phải là ID người đối diện, không phải của mình
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
              const isSelected =
                activeChat?.followed_user_id === item.followed_user_id ||
                activeChat?.user_id === item.user_id;
              return (
                <div
                  key={`${item.followed_user_id}-${item.user_id}`}
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
            <div
              className="messages-chat-body"
              ref={chatBodyRef}
              onScroll={handleScroll}
            >
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
                onClick={() => messageInputRef.current?.focus()}
              >
                <input
                  ref={messageInputRef}
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
                  onClick={(e) => e.stopPropagation()}
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
