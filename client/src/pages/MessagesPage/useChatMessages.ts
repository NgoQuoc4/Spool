import { useEffect, useRef, useState } from "react";
import { usersApi } from "@/apis/users.api";
import type { ChatMessage } from "./types";

export const useChatMessages = (activeChatUserId?: string) => {
  // Danh sách tin nhắn trong khung chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // Còn tin nhắn cũ để tải?
  const [hasMore, setHasMore] = useState(true);
  // Đang tải thêm tin cũ?
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs cuộn
  const messagesEndRef = useRef<HTMLDivElement>(null); // Anchor để cuộn xuống cuối
  const chatBodyRef = useRef<HTMLDivElement>(null); // Detect scroll lên đầu

  // Helper: cuộn xuống cuối khung chat
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Helper: chuyển đổi format tin nhắn từ backend → ChatMessage
  const formatMessage = (m: any): ChatMessage => ({
    id: m.id,
    senderId: m.senderId,
    message: m.content,
    timestamp: new Date(m.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  // ============================================================
  // Tải lịch sử tin nhắn ban đầu khi chọn một cuộc hội thoại
  // ============================================================
  useEffect(() => {
    if (!activeChatUserId) return;

    const fetchInitialMessages = async () => {
      try {
        setChatMessages([]);
        setHasMore(true);

        const response = await usersApi.getMessages(activeChatUserId, {
          limit: 50,
        });

        const messages = response.data.data.map(formatMessage);
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
  }, [activeChatUserId]);

  // ============================================================
  // Tải thêm tin nhắn cũ khi cuộn lên đầu (Cursor-based pagination)
  // ============================================================
  const handleScroll = async () => {
    const container = chatBodyRef.current;
    if (!container || !activeChatUserId || !hasMore || isLoadingMore) return;

    if (container.scrollTop === 0 && chatMessages.length > 0) {
      const oldestMessageId = chatMessages[0]?.id;
      if (!oldestMessageId) return;

      setIsLoadingMore(true);
      const prevScrollHeight = container.scrollHeight;

      try {
        const response = await usersApi.getMessages(activeChatUserId, {
          limit: 50,
          cursor: oldestMessageId,
        });

        const olderMessages = response.data.data.map(formatMessage);

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

  return {
    chatMessages,
    setChatMessages,
    hasMore,
    isLoadingMore,
    chatBodyRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
  };
};

export default useChatMessages;
