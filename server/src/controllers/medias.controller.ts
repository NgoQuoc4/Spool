import { NextFunction, Request, Response } from "express";
import path from "path";
import { IMAGE_DIR, VIDEO_DIR } from "~/constants/dir";
import { MediaType } from "~/constants/enums";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { userMessage } from "~/constants/messages";
import mediasService from "~/services/medias.service";
import fs from "fs";
import mime from "mime";
export const uploadImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await mediasService.uploadImage(req);
  return res.json({
    message: userMessage.UPLOAD_IMAGE_SUCCESS,
    url: result,
    type: MediaType.Image,
  });
};

export const uploadVideoController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await mediasService.uploadVideo(req);
  return res.json({
    message: userMessage.UPLOAD_VIDEO_SUCCESS,
    url: result,
    type: MediaType.Video,
  });
};

export const uploadFileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await mediasService.uploadFile(req);
  return res.json({
    message: userMessage.UPLOAD_FILE_SUCCESS,
    url: result,
    type: MediaType.File,
  });
};
// Serving static files - lấy ảnh, video, file tĩnh từ server
export const serveStatic =
  (folder: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    const filePath = path.resolve(folder, name as string);
    console.log("==========================", filePath);
    return res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: userMessage.NOT_FOUND });
      }
    });
  };

export const serveM3u8Controller =
  (folder: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const filePath = path.resolve(folder, id as string, "master.m3u8");
    console.log("==========================", filePath);
    return res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: userMessage.NOT_FOUND });
      }
    });
  };

export const serveVideoHlsController =
  (folder: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, v, segment } = req.params;

    const filePath = path.resolve(
      folder,
      id as string,
      v as string,
      segment as string,
    );
    return res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: userMessage.NOT_FOUND });
      }
    });
  };
export const serveVideoStreamingController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Lấy tên file từ URL param, rồi tạo đường dẫn tuyệt đối tới file video
  const { name } = req.params;
  const videoPath = path.resolve(VIDEO_DIR, name as string);

  if (!fs.existsSync(videoPath)) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: userMessage.NOT_FOUND });
  }

  // Browser/client gửi header "Range" để yêu cầu một đoạn byte cụ thể của video
  // Nếu không có Range header → phục vụ toàn bộ file video qua sendFile
  const range = req.headers.range;
  if (!range) {
    return res.sendFile(videoPath);
  }

  // Lấy tổng dung lượng file (bytes) để tính toán range và Content-Range header
  const videoSize = fs.statSync(videoPath).size;

  // Giới hạn mỗi chunk tối đa 1MB → tránh gửi cả file 1 lần, tiết kiệm RAM
  const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB per chunk

  // Parse Range header: "bytes=start-end" → tách ra start và end
  const [start, end] = range.replace("bytes=", "").split("-");
  const startByte = Number(start);

  // Nếu client không gửi end (vd: "bytes=0-") → tự tính end = start + 1MB
  // Nếu client gửi end cụ thể (vd seek đến giữa video) → dùng đúng giá trị đó
  const endByte = end
    ? Number(end)
    : Math.min(startByte + CHUNK_SIZE - 1, videoSize - 1);

  // Số byte thực sự sẽ gửi trong response này
  const chunkSize = endByte - startByte + 1;

  // Content-Range cho client biết đang nhận đoạn nào / tổng bao nhiêu
  // Ví dụ: "bytes 0-1048575/5242880"
  const contentRange = `bytes ${startByte}-${endByte}/${videoSize}`;

  // Tự động detect MIME type từ extension file (mp4 → "video/mp4", v.v.)
  const contentType = mime.getType(videoPath) || "video/*";

  const headers = {
    "Content-Range": contentRange, // vị trí chunk trong toàn bộ file
    "Accept-Ranges": "bytes", // báo client rằng server hỗ trợ range request
    "Content-Length": chunkSize, // kích thước chunk đang gửi
    "Content-Type": contentType, // loại media (video/mp4, ...)
  };

  // Tạo read stream chỉ đọc đúng đoạn [startByte, endByte] của file
  // → không load toàn bộ file vào RAM
  const readStream = fs.createReadStream(videoPath, {
    start: startByte,
    end: endByte,
  });

  // 206 Partial Content: chuẩn HTTP cho streaming / range request
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);

  // Pipe stream thẳng vào response → gửi dữ liệu theo từng chunk đến client
  readStream.pipe(res);
};

export const uploadVideoHlsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await mediasService.uploadVideoHls(req);
  return res.json({
    message: userMessage.UPLOAD_VIDEO_HLS_SUCCESS,
    url: result,
    result,
    type: MediaType.HLS,
  });
};
