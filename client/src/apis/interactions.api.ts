import http from './http';
import { ENDPOINTS } from '@/constants/endpoints';

export const interactionsApi = {
  like: (tweet_id: string) =>
    http.post(ENDPOINTS.LIKES, { tweet_id }),

  unlike: (tweet_id: string) =>
    http.delete(ENDPOINTS.LIKES, { data: { tweet_id } }),

  bookmark: (tweet_id: string) =>
    http.post(ENDPOINTS.BOOKMARKS, { tweet_id }),

  unbookmark: (tweet_id: string) =>
    http.delete(ENDPOINTS.BOOKMARKS, { data: { tweet_id } }),
};
