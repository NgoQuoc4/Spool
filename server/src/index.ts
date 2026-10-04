import "dotenv/config";
import express, { Request, Response } from "express";
import userRouter from "./routers/user.router";
import dataservice from "./services/database.service";
import { defaultErrorHanlde } from "./middlewares/error.middlewares";
import mediasRouter from "./routers/medias.router";
import fs from "fs";
dataservice
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");
    dataservice.indexUser();
    dataservice.indexRefreshToken();
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 4000;

import {
  IMAGE_DIR,
  VIDEO_DIR,
  FILE_DIR,
  IMAGE_TEMP_DIR,
  VIDEO_TEMP_DIR,
  FILE_TEMP_DIR,
} from "./constants/dir";
import staticRouter from "./routers/static.router";

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

import cors from "cors";
import tweetsRouter from "./routers/tweets.router";
import likeRouter from "./routers/likes.router";
import bookmarkRouter from "./routers/bookmarks.router";

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
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost :${PORT}`);
});

export default app;
