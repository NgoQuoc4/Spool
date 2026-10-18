import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "~/utils/jwt";
import { registerChatHandlers } from "./chat.socket";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL, "http://localhost:3000"].filter(
        Boolean,
      ) as string[],
      credentials: true,
    },
  });
  // 1. Middleware Auth tập trung
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = await verifyToken({
        token,
        secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      }); // Giải mã JWT bằng ACCESS_TOKEN_SECRET
      socket.data.user = decoded;
      next(); // Cho phép kết nối
    } catch (error) {
      next(new Error("Authentication error: Invalid token")); // Từ chối kết nối
    }
  });

  // 2. Connection & Join Room
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user.user_id;
    if (userId) {
      socket.join(`user:${userId}`); // Join room theo userId
    }
    console.log("connect", socket.id);
    // Đăng ký các handler riêng biệt
    registerChatHandlers(io, socket);
    socket.on("disconnect", () => {
      console.log("disconnect", socket.id);
      // Room tự động rời khi socket disconnect, không cần dọn dẹp thủ công
    });
  });
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};
