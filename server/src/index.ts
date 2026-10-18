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
import botsService from "./services/bots.service";
import botsRouter from "./routers/bots.router";
import notificationsRouter from "./routers/notifications.router";
import { healthRouter } from "./routers/health.router";
import { initSocket } from "./sockets";
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

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:3000"].filter(
  Boolean,
) as string[];

// khởi tạo socket
export const io = initSocket(httpServer);
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
app.use("/bots", botsRouter);
app.use("/notifications", notificationsRouter);
app.use("/health", healthRouter);

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

  // Khởi động scheduler dựa trên cài đặt bot trong DB (chỉ chạy nếu is_active = true)
  botsService.initScheduler();
});

export default app;
