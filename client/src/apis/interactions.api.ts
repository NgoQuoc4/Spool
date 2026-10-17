import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";

export const interactionsApi = {
  like: (tweetId: string) => http.post(ENDPOINTS.LIKES, { tweetId }),

  unlike: (tweetId: string) => http.post(ENDPOINTS.LIKES, { tweetId }),

  bookmark: (tweetId: string) => http.post(ENDPOINTS.BOOKMARKS, { tweetId }),

  unbookmark: (tweetId: string) =>
    http.delete(ENDPOINTS.BOOKMARKS, { data: { tweetId } }),
};
