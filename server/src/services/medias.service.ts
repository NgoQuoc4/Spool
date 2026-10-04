import { Request } from "express";
import { FILE_DIR, IMAGE_DIR, VIDEO_DIR } from "~/constants/dir";
import {
  handlerUploadVideo,
  handlerUploadFile,
  buildFilePath,
  handlerUploadImage,
} from "~/utils/file";
import fs from "fs";
import { BASE_URL } from "~/constants/config";
import { ImageExtension } from "~/constants/extension";
import sharp from "sharp";
import { encodeHLSWithMultipleVideoStreams } from "~/utils/video";
import path from "path";
import dataservice from "./database.service";
import VideoStatus from "~/models/schemas/VideoStatus.schema";
import { EncodeStatus } from "~/constants/enums";
class MediasService {
  constructor() {}
  async uploadImage(req: Request) {
    const file = await handlerUploadImage(req);

    const originalFile = await Promise.all(
      (file as any).files.image.map(async (item: any) => {
        const { newName, newPath } = buildFilePath(
          item.newFilename,
          IMAGE_DIR,
          ImageExtension.Jpg,
        );
        await sharp(item.filepath).jpeg({ quality: 80 }).toFile(newPath);
        fs.unlinkSync(item.filepath); // xoá file tạm của formidable
        return `${BASE_URL}/static/images/${newName}`;
      }),
    );
    return originalFile;
  }

  async uploadVideo(req: Request) {
    const file = await handlerUploadVideo(req);
    const originalFile =
      (await Promise.all(
        (file as any).files.video.map(async (item: any) => {
          const { newName, newPath } = buildFilePath(
            item.newFilename,
            VIDEO_DIR,
          );
          fs.renameSync(item.filepath, newPath);
          return `${BASE_URL}/static/video-stream/${newName}`;
        }),
      )) || (file as any).files.video[0];

    return originalFile;
  }

  async uploadFile(req: Request) {
    const file = await handlerUploadFile(req);
    const originalFile =
      Promise.all(
        (file as any).files.file.map(async (item: any) => {
          const { newName, newPath } = buildFilePath(
            item.newFilename,
            FILE_DIR,
          );
          fs.renameSync(item.filepath, newPath);
          return `${BASE_URL}/static/files/${newName}`;
        }),
      ) || (file as any).files.file[0];

    return originalFile;
  }

  async uploadVideoHls(req: Request) {
    const file = await handlerUploadVideo(req);
    const originalFile = await Promise.all(
      (file as any).files.video.map(async (item: any) => {
        const { newName, newPath } = buildFilePath(item.newFilename, VIDEO_DIR);
        fs.renameSync(item.filepath, newPath);
        // // Fire & forget: encode chạy nền, không block response
        // encodeHLSWithMultipleVideoStreams(newPath).catch(console.error);
        videoQueue.enqueue(newPath);
        // videoId = tên file không có extension (khớp với subfolder encode ra)
        const videoId = newName.replace(/\.[^.]+$/, "");
        return `${BASE_URL}/static/video-hls/${videoId}/master.m3u8`;
      }),
    );
    return originalFile;
  }
}

export default new MediasService();

class Queue {
  items: string[] = [];
  encoding: boolean = false;

  async enqueue(item: string) {
    this.items.push(item);
    const idName = path.basename(item, path.extname(item));
    // tạo video status
    await dataservice.videoStatuses.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodeStatus.Pending,
      }),
    );
    this.processEncode();
  }

  async processEncode() {
    if (this.encoding || this.items.length === 0) return;
    this.encoding = true;
    const videoPath = this.items.shift()!;
    const idName = path.basename(videoPath, path.extname(videoPath));

    try {
      await dataservice.videoStatuses.updateOne(
        {
          name: idName,
        },
        {
          $set: {
            status: EncodeStatus.Processing,
            updatedAt: new Date(),
          },
        },
      );
      await encodeHLSWithMultipleVideoStreams(videoPath);
      // cập nhật video status thành công
      await dataservice.videoStatuses.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodeStatus.Success,
            updatedAt: new Date(),
          },
        },
      );
      console.log(`Encode video ${idName} thành công! 🎉`);
    } catch (error) {
      await dataservice.videoStatuses.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodeStatus.Failed,
            message:
              (error as Error).message || "Lỗi không xác định khi encode",
            updatedAt: new Date(),
          },
        },
      );
      console.error(`Encode video ${idName} thất bại:`, error);
    } finally {
      this.encoding = false;
      // 7. Tiếp tục lấy video tiếp theo trong queue để xử lý
      this.processEncode();
    }
  }
}
export const videoQueue = new Queue();
