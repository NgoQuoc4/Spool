import { Router } from "express";
import {
  serveM3u8Controller,
  serveStatic,
  serveVideoHlsController,
  serveVideoStreamingController,
} from "~/controllers/medias.controller";
import { wrapAsync } from "~/utils/handles";
import { IMAGE_DIR, VIDEO_DIR, FILE_DIR } from "~/constants/dir";

const staticRouter = Router();
// serving image - trả file tĩnh
staticRouter.get("/images/:name", wrapAsync(serveStatic(IMAGE_DIR)));
// serving video - streaming video theo từng chunk
staticRouter.get("/video-stream/:name", serveVideoStreamingController);
// serving HLS - serve toàn bộ folder m3u8 + ts segments của một video
// staticRouter.use("/video-hls", express.static(VIDEO_DIR));

// serve file m3u8
staticRouter.get(
  "/video-hls/:id/master.m3u8",
  wrapAsync(serveM3u8Controller(VIDEO_DIR)),
);
// serve file ts
staticRouter.get(
  "/video-hls/:id/:v/:segment",
  wrapAsync(serveVideoHlsController(VIDEO_DIR)),
);

// serving file - trả file tĩnh
staticRouter.get("/files/:name", wrapAsync(serveStatic(FILE_DIR)));

export default staticRouter;
