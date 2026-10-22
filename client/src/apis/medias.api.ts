import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";
// import type { Media } from "@/types/tweet.types";

export interface UploadImageResponse {
  message: string;
  url: string[];
  type: number;
}

export interface UploadVideoResponse {
  message: string;
  url: string[];
  duration?: number;
  type?: number | string;
  result?: string[];
}

export const mediasApi = {
  uploadImage: (formData: FormData) =>
    http.post<UploadImageResponse>(ENDPOINTS.UPLOAD_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  uploadVideo: (formData: FormData) =>
    http.post<UploadVideoResponse>(ENDPOINTS.UPLOAD_VIDEO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  uploadVideoHls: (formData: FormData) =>
    http.post<UploadVideoResponse>(ENDPOINTS.UPLOAD_VIDEO_HLS, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
