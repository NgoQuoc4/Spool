import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage, Conversation } from "./types";

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
  const socketRef = useRef<Socket | null>(null);
  // Stale closure fix: Ref luôn giữ giá trị activeChat mới nhất
  // giúp socket callback đọc được người đang chat mà không cần reconnect socket
  const activeChatRef = useRef<Conversation | null>(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Khởi tạo kết nối Socket.IO
  useEffect(() => {
    if (!profileId) return;
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { id: profileId },
      autoConnect: true,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });
    // Lắng nghe tin nhắn gửi đến
    socket.on("receive-chat-message", (data: any) => {
      // 1. Nếu người gửi chính là người đang mở chat -> Đẩy vào khung chat
      if (activeChatRef.current?.user_id === data.from) {
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
    return () => {
      socket.disconnect();
    };
  }, [profileId]); // Chỉ kết nối 1 lần duy nhất cho mỗi user đăng nhập

  // Hàm phát sự kiện gửi tin nhắn qua Socket
  const emitChatMessage = (toUserId: string, message: string) => {
    if (!socketRef.current || !profileId) return;
    socketRef.current.emit("send-chat-message", {
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
