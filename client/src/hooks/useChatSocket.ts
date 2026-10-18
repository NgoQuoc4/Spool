import { useEffect, useRef } from "react";
import type { ChatMessage, Conversation } from "../pages/MessagesPage/types";
import { useSocket } from "@/contexts/SocketContext";
import { useSocketEvent } from "@/hooks/useSocketEvent";

interface UseChatSocketParams {
  profileId?: string;
  profileUsername?: string;
  activeChat: Conversation | null;
  onMessageReceived: (message: ChatMessage) => void;
  onConversationUpdated: (fromUserId: string, lastMessage: string) => void;
}
const useChatSocket = ({
  profileId,
  profileUsername,
  activeChat,
  onMessageReceived,
  onConversationUpdated,
}: UseChatSocketParams) => {
  const socket = useSocket();
  // Stale closure fix: Ref luôn giữ giá trị activeChat mới nhất
  // giúp socket callback đọc được người đang chat mà không cần reconnect socket
  const activeChatRef = useRef<Conversation | null>(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Lắng nghe tin nhắn gửi đến bằng hook dùng chung
  useSocketEvent("receive-chat-message", (data: any) => {
    // 1. Nếu người gửi chính là người đang mở chat -> Đẩy vào khung chat
    const currentActiveId = activeChatRef.current?.userId;
    if (currentActiveId === data.from) {
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
      onMessageReceived(incomingMsg);
    }
    // 2. Cập nhật preview tin nhắn cuối ở danh sách hội thoại
    onConversationUpdated(data.from, data.message);
  });

  // Hàm phát sự kiện gửi tin nhắn qua Socket
  const emitChatMessage = (toUserId: string, message: string) => {
    if (!socket || !profileId) return;
    socket.emit("send-chat-message", {
      to: toUserId,
      message,
      from: profileId,
      username: profileUsername || "You",
    });
  };

  // Trả về hàm phát sự kiện để component sử dụng
  return { emitChatMessage };
};

export default useChatSocket;
