import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Tweet, CreateTweetBody } from "@/types/tweet.types";

interface TweetsQuery {
  limit?: number;
  page?: number;
  author_id?: string;
}

export interface TweetsResponse {
  message: string;
  result: {
    tweets: Tweet[];
    limit: number;
    page: number;
    total_page: number;
  };
}

export const tweetsApi = {
  getAllTweets: (params?: TweetsQuery) =>
    http.get<TweetsResponse>(ENDPOINTS.TWEETS, { params }),

  getTweet: (tweet_id: string) =>
    http.get<{ message: string; result: Tweet }>(ENDPOINTS.TWEET(tweet_id)),

  createTweet: (body: CreateTweetBody) =>
    http.post<{ message: string; result: Tweet }>(ENDPOINTS.CREATE_TWEET, body),

  deleteTweet: (tweet_id: string) =>
    http.delete<{ message: string; result: Tweet }>(
      ENDPOINTS.DELETE_TWEET(tweet_id),
    ),
};
