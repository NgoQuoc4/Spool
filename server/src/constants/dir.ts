import path from "path";

// Thư mục chính thức (file đã xử lý xong)
export const UPLOAD_MEDIA_DIR = path.resolve("uploads/medias");
export const IMAGE_DIR = path.join(UPLOAD_MEDIA_DIR, "images");
export const VIDEO_DIR = path.join(UPLOAD_MEDIA_DIR, "videos");
export const FILE_DIR = path.join(UPLOAD_MEDIA_DIR, "files");

// Thư mục tạm (formidable ghi vào đây trước)
export const UPLOAD_TEMP_DIR = path.resolve("uploads/temp");
export const IMAGE_TEMP_DIR = path.join(UPLOAD_TEMP_DIR, "images");
export const VIDEO_TEMP_DIR = path.join(UPLOAD_TEMP_DIR, "videos");
export const FILE_TEMP_DIR = path.join(UPLOAD_TEMP_DIR, "files");
