import { Server, Socket } from "socket.io";
import prisma from "~/services/prisma.service";
import { emitToUser } from "./index";

interface MessagePayload {
  to: string; // id người nhận
  from: string; // id người gửi
  message: string; // nội dung tin nhắn
  username?: string;
}

export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on("send-chat-message", async (data: MessagePayload) => {
    try {
      const savedMessage = await prisma.message.create({
        data: {
          sender_id: socket.data.user.user_id,
          receiver_id: data.to,
          content: data.message,
        },
      });
      // ✅ Gửi realtime vào Room của người nhận đồng nhất qua emitToUser
      emitToUser(data.to, "receive-chat-message", {
        id: savedMessage.id,
        from: savedMessage.sender_id,
        to: savedMessage.receiver_id,
        message: savedMessage.content,
        created_at: savedMessage.created_at,
        username: data.username,
      });
    } catch (error) {
      console.error("Lỗi khi lưu tin nhắn:", error);
    }
  });
};

