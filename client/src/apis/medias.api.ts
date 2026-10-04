import http from './http';
import { ENDPOINTS } from '@/constants/endpoints';
import type { Media } from '@/types/tweet.types';

export const mediasApi = {
  uploadImage: (formData: FormData) =>
    http.post<{ message: string; result: Media[] }>(ENDPOINTS.UPLOAD_IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadVideo: (formData: FormData) =>
    http.post<{ message: string; result: Media[] }>(ENDPOINTS.UPLOAD_VIDEO, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
