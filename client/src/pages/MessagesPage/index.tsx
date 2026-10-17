import { useAuth } from "@/contexts/AuthContext";
import "./messages.css";
import ConversationSidebar from "./ConversationSidebar";
import type { ChatMessage } from "./types";
import NewMessageModal from "./NewMessageModal";
import ChatEmptyState from "./ChatEmptyState";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import useChatSocket from "./useChatSocket";
import useChatMessages from "./useChatMessages";
import useConversations from "./useConversations";
import { useState } from "react";

const MessagesPage = () => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    conversations,
    activeChat,
    setActiveChat,
    updateConversationPreview,
    startNewChat,
    deleteConversation,
  } = useConversations(profile?._id);

  const activeChatId = activeChat?.userId;

  const {
    chatMessages,
    setChatMessages,
    isLoadingMore,
    chatBodyRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
  } = useChatMessages(activeChatId);

  const { emitChatMessage } = useChatSocket({
    profileId: profile?._id,
    profileUsername: profile?.username,
    activeChat,
    onMessageReceived: (incomingMsg) => {
      setChatMessages((prev) => [...prev, incomingMsg]);
      setTimeout(() => scrollToBottom("smooth"), 50);
    },
    onConversationUpdated: (fromUserId, lastMessage) => {
      updateConversationPreview(fromUserId, lastMessage, "Vừa xong");
    },
  });

  // ============================================================
  // HANDLER: Gửi tin nhắn — emit socket + optimistic update UI
  // ============================================================
  const handleSendMessage = (messageText: string) => {
    if (!activeChat || !profile?._id || !activeChatId) return;

    emitChatMessage(activeChatId, messageText);

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
    updateConversationPreview(activeChatId, messageText, "Just now");
  };

  return (
    <div className="messages-container">
      {/* LEFT COLUMN: danh sách cuộc hội thoại */}
      <ConversationSidebar
        conversations={conversations}
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        onDeleteChat={deleteConversation}
        onOpenNewModal={() => setIsModalOpen(true)}
      />

      {/* RIGHT COLUMN: khung chat hoặc empty state */}
      <main
        className={`messages-main-pane ${!activeChat ? "hidden-mobile" : ""}`}
      >
        {!activeChat ? (
          <ChatEmptyState
            hasConversations={conversations.length > 0}
            onStartFirstChat={() => setActiveChat(conversations[0])}
            onOpenNewModal={() => setIsModalOpen(true)}
          />
        ) : (
          <>
            <ChatHeader activeChat={activeChat} setActiveChat={setActiveChat} />
            <ChatMessages
              messages={chatMessages}
              onScroll={handleScroll}
              chatBodyRef={chatBodyRef}
              messagesEndRef={messagesEndRef}
              isLoadingMore={isLoadingMore}
            />
            <ChatInput onSend={handleSendMessage} />
          </>
        )}
      </main>

      {/* MODAL: tìm người dùng mới để nhắn tin */}
      <NewMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectUser={(user) => {
          startNewChat(user, profile?._id);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default MessagesPage;
