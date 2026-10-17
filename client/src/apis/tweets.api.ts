import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Tweet, CreateTweetBody } from "@/types/tweet.types";
import type { ApiSuccess, ApiPaginated } from "@/types/api.types";

interface TweetsQuery {
  limit?: number;
  page?: number;
  authorId?: string;
  author_id?: string;
  followingOnly?: string;
  following_only?: string;
  likedOnly?: string;
  liked_only?: string;
  bookmarkOnly?: string;
  bookmark_only?: string;
}

export const tweetsApi = {
  getAllTweets: (params?: TweetsQuery) =>
    http.get<ApiPaginated<Tweet>>(ENDPOINTS.TWEETS, { params }),

  getTweet: (tweet_id: string) =>
    http.get<ApiSuccess<Tweet>>(ENDPOINTS.TWEET(tweet_id)),

  createTweet: (body: CreateTweetBody) =>
    http.post<ApiSuccess<Tweet>>(ENDPOINTS.CREATE_TWEET, body),

  getTweetChildren: (
    tweet_id: string,
    params?: { limit?: number; page?: number },
  ) => http.get<ApiPaginated<Tweet>>(ENDPOINTS.TWEET_CHILDREN(tweet_id), { params }),

  deleteTweet: (tweet_id: string) =>
    http.delete<ApiSuccess<Tweet>>(ENDPOINTS.DELETE_TWEET(tweet_id)),

  unretweet: (tweet_id: string) =>
    http.delete<ApiSuccess<unknown>>(ENDPOINTS.UNRETWEET(tweet_id)),
};
