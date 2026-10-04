import path from "path";
import { Request } from "express";
import formidable, { File, Files } from "formidable";
import { IMAGE_TEMP_DIR, VIDEO_TEMP_DIR, FILE_TEMP_DIR } from "~/constants/dir";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { userMessage } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/errors";
import { randomUUIDv7 } from "crypto";
// ── Upload image  single ─────────────────────────────────────────────────────────────
export const handlerUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: IMAGE_TEMP_DIR,
    maxFileSize: 4 * 1024 * 1024, // 4MB
    maxTotalFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
    filter: ({ name, mimetype }) => {
      if (name !== "image") return false;
      const validMime = Boolean(mimetype?.startsWith("image/"));
      if (!validMime) {
        form.emit(
          "error" as any,
          new ErrorWithStatus({
            message: userMessage.INVALID_FILE_TYPE,
            status: HTTP_STATUS.BAD_REQUEST,
          }),
        );
      }
      return validMime;
    },
  });

  // Ghi file tạm vào IMAGE_TEMP_DIR
  form.on("fileBegin", (_name, file) => {
    file.filepath = path.join(IMAGE_TEMP_DIR, file.newFilename as string);
  });

  return new Promise<{ fields: any; files: Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (!files.image || files.image.length === 0) {
        return reject(
          new ErrorWithStatus({
            message: userMessage.FILE_IMAGE_IS_REQUIRED,
            status: HTTP_STATUS.BAD_REQUEST,
          }),
        );
      }
      resolve({ fields, files });
    });
  });
};

// ── Upload video ─────────────────────────────────────────────────────────────
export const handlerUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: VIDEO_TEMP_DIR,
    maxFileSize: 1000 * 1024 * 1024, // 1000MB
    keepExtensions: true,
    filter: ({ name, mimetype }) => {
      if (name !== "video") return false;
      const validMime = Boolean(mimetype?.startsWith("video/"));
      if (!validMime) {
        form.emit(
          "error" as any,
          new ErrorWithStatus({
            message: userMessage.INVALID_FILE_TYPE,
            status: HTTP_STATUS.BAD_REQUEST,
          }),
        );
      }
      return validMime;
    },
  });

  form.on("fileBegin", (_name, file) => {
    file.filepath = path.join(VIDEO_TEMP_DIR, file.newFilename as string);
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      if (!files.video || (files.video as any).length === 0) {
        return reject(
          new ErrorWithStatus({
            message: userMessage.FILE_VIDEO_IS_REQUIRED,
            status: HTTP_STATUS.BAD_REQUEST,
          }),
        );
      }
      resolve({ fields, files });
    });
  });
};

// ── Upload file bất kỳ (pdf, doc, zip, ...) ──────────────────────────────────
const BLOCKED_MIME = ["application/x-msdownload", "application/x-executable"];

export const handlerUploadFile = async (req: Request) => {
  const form = formidable({
    uploadDir: FILE_TEMP_DIR,
    maxFileSize: 20 * 1024 * 1024, // 20MB
    keepExtensions: true,
    filter: ({ name, mimetype }) => {
      if (name !== "file") return false;
      const blocked = BLOCKED_MIME.some((m) => mimetype?.includes(m));
      if (blocked) {
        form.emit(
          "error" as any,
          new ErrorWithStatus({
            message: userMessage.INVALID_FILE_TYPE,
            status: HTTP_STATUS.BAD_REQUEST,
          }),
        );
        return false;
      }
      return true;
    },
  });

  form.on("fileBegin", (_name, file) => {
    file.filepath = path.join(FILE_TEMP_DIR, file.newFilename as string);
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      if (!files.file || (files.file as any).length === 0) {
        return reject(
          new ErrorWithStatus({
            message: userMessage.FILE_IS_REQUIRED,
            status: HTTP_STATUS.BAD_REQUEST,
          }),
        );
      }
      resolve({ fields, files });
    });
  });
};

// ── File path helpers ────────────────────────────────────────────────────────
/**
 * Tạo path mới cho file:
 * - Đổi tên (UUID mới)
 * - Đổi thư mục (dir)
 * - Đổi đuôi file (newExt tuỳ chọn, mặc định giữ nguyên)
 *
 * @example
 * buildFilePath("abc.upload", IMAGE_DIR)        // → "uploads/images/<uuid>.upload"
 * buildFilePath("abc.upload", IMAGE_DIR, "jpg") // → "uploads/images/<uuid>.jpg"
 */
export const buildFilePath = (
  originalName: string,
  dir: string,
  newExt?: string,
) => {
  const ext = newExt ?? originalName.split(".").pop() ?? "";
  const newName = `${randomUUIDv7()}.${ext}`;
  return { newName, newPath: path.join(dir, newName) };
};
