import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usersApi } from "@/apis/users.api";
import type { ChatMessage } from "./types";

export const useChatMessages = (activeChatUserId?: string) => {
  // Danh sách tin nhắn hiển thị trong khung chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Refs điều khiển vị trí cuộn
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

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

  // Reset tin nhắn khi chuyển sang trò chuyện với người khác
  useEffect(() => {
    setChatMessages([]);
  }, [activeChatUserId]);

  // ============================================================
  // Tải lịch sử tin nhắn và phân trang Cursor bằng useInfiniteQuery
  // ============================================================
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["chat_messages", activeChatUserId],
    queryFn: async ({ pageParam }) => {
      const response = await usersApi.getMessages(activeChatUserId!, {
        limit: 50,
        cursor: pageParam || undefined,
      });
      return response.data.data.map(formatMessage);
    },
    initialPageParam: "",
    // Cursor cho lần tải tiếp theo là ID của tin nhắn cũ nhất (nằm ở đầu mảng trả về)
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 50) return undefined;
      return lastPage[0]?.id;
    },
    enabled: Boolean(activeChatUserId),
    staleTime: 1000 * 60 * 5, // Cache 5 phút khi chuyển qua lại giữa các đoạn chat
  });

  // Đồng bộ dữ liệu từ query cache vào state hiển thị
  useEffect(() => {
    if (!data?.pages) return;

    // Các trang mới hơn nằm ở page 0, cũ hơn ở page 1, 2...
    // Đảo ngược thứ tự các page để nối thành chuỗi thời gian tăng dần (cũ ở trên, mới ở dưới)
    const allFetched = [...data.pages].reverse().flat();

    setChatMessages((prev) => {
      const allFetchedIds = new Set(allFetched.map((m) => m.id));
      // Giữ lại các tin nhắn mới nhất vừa nhận qua Socket hoặc vừa gửi
      const pendingLiveMessages = prev.filter((m) => !allFetchedIds.has(m.id));
      return [...allFetched, ...pendingLiveMessages];
    });

    // Tự động cuộn xuống đáy ở lần đầu tiên mở cuộc trò chuyện
    if (data.pages.length === 1) {
      setTimeout(() => scrollToBottom("auto"), 50);
    }
  }, [data?.pages]);

  // ============================================================
  // Tải thêm tin nhắn cũ khi người dùng cuộn lên đỉnh khung chat
  // ============================================================
  const handleScroll = async () => {
    const container = chatBodyRef.current;
    if (
      !container ||
      !activeChatUserId ||
      !hasNextPage ||
      isFetchingNextPage
    )
      return;

    if (container.scrollTop === 0) {
      const prevScrollHeight = container.scrollHeight;

      await fetchNextPage();

      // Giữ nguyên vị trí cuộn để màn hình không bị giật
      requestAnimationFrame(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop =
            chatBodyRef.current.scrollHeight - prevScrollHeight;
        }
      });
    }
  };

  return {
    chatMessages,
    setChatMessages,
    hasMore: Boolean(hasNextPage),
    isLoadingMore: isFetchingNextPage,
    chatBodyRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
  };
};

export default useChatMessages;
