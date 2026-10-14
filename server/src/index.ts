import "dotenv/config";
import express, { Request, Response } from "express";
import userRouter from "./routers/user.router";
import prisma from "./services/prisma.service";
import { defaultErrorHanlde } from "./middlewares/error.middlewares";
import mediasRouter from "./routers/medias.router";
import fs from "fs";
import {
  IMAGE_DIR,
  VIDEO_DIR,
  FILE_DIR,
  IMAGE_TEMP_DIR,
  VIDEO_TEMP_DIR,
  FILE_TEMP_DIR,
} from "./constants/dir";
import staticRouter from "./routers/static.router";
import cors from "cors";
import tweetsRouter from "./routers/tweets.router";
import likeRouter from "./routers/likes.router";
import bookmarkRouter from "./routers/bookmarks.router";
import searchsRouter from "./routers/searchs.router";
import { createServer } from "http";
import { Server } from "socket.io";
prisma
  .$connect()
  .then(() => console.log("Connected to PostgreSQL via Prisma ✅"))
  .catch((error: any) => {
    console.error("Error connecting to PostgreSQL:", error);
    process.exit(1);
  });
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

interface MessagePayload {
  to: string; // id người nhận
  from: string; // id người gửi
  message: string; // nội dung tin nhắn
  username?: string;
}
// Lưu ý: Type của users là Record<string, string> vì bạn gán users[user_id] = socket.id
const users: Record<string, string> = {};

io.on("connection", (socket: any) => {
  console.log("connect", socket.id);
  const user_id = socket.handshake.auth.id;
  if (user_id) {
    users[user_id] = socket.id;
  }

  //  nhận tin nhắn từ client qua "chat-message"
  socket.on("send-chat-message", async (data: MessagePayload) => {
    try {
      const savedMessage = await prisma.message.create({
        data: {
          sender_id: data.from,
          receiver_id: data.to,
          content: data.message,
        },
      });
      // 2. Gửi realtime cho người nhận (nếu người nhận đang online)
      const receiver_socket_id = users[data.to];
      // gửi tin nhắn tới user khác qua event "send-chat-message"
      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit("receive-chat-message", {
          id: savedMessage.id,
          from: savedMessage.sender_id,
          to: savedMessage.receiver_id,
          message: savedMessage.content,
          created_at: savedMessage.created_at,
          username: data.username,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu tin nhắn:", error);
    }
  });

  socket.on("disconnect", () => {
    delete users[user_id];
    console.log("disconnect", socket.id);
  });
});

// Tạo tất cả thư mục upload khi khởi động (recursive tự bỏ qua nếu đã tồn tại)
for (const dir of [
  IMAGE_DIR,
  VIDEO_DIR,
  FILE_DIR,
  IMAGE_TEMP_DIR,
  VIDEO_TEMP_DIR,
  FILE_TEMP_DIR,
]) {
  fs.mkdirSync(dir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Twitter API is running 🚀" });
});

app.use("/user", userRouter);
app.use("/medias", mediasRouter);
app.use("/tweets", tweetsRouter);
app.use("/likes", likeRouter);
app.use("/bookmarks", bookmarkRouter);
app.use("/search", searchsRouter);
// để public file trên mạng
// Cách 1
// app.use("/static/images", express.static(IMAGE_DIR));
// app.use("/static/videos", express.static(VIDEO_DIR));
// app.use("/static/files", express.static(FILE_DIR));
// Cách 2
app.use("/static", staticRouter);
// default error handler (phải đặt sau tất cả các route)

app.use(defaultErrorHanlde);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

export default app;
