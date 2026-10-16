import type { Author } from "@/types";

export const TweetType = {
  TWEET: "tweet",
  RETWEET: "retweet",
  QUOTETWEET: "quote",
  COMMENT: "comment",
  COMMENT_RETWEET: "comment_retweet",
  COMMENT_QUOTETWEET: "comment_quotetweet",
} as const;
export type TweetType = (typeof TweetType)[keyof typeof TweetType];

export const TweetAudienceType = {
  EVERYONE: "everyone",
  FOLLOWING: "following",
  FOLLOWING_AND_MEDIA: "following_and_media",
  MENTIONED_USERS: "mentioned_users",
  TWEET_CIRCLE: "tweet_circle",
} as const;
export type TweetAudienceType =
  (typeof TweetAudienceType)[keyof typeof TweetAudienceType];

export const MediaType = {
  IMAGE: "image",
  VIDEO: "video",
  HLS: "hls",
  FILE: "file",
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export interface Media {
  url: string;
  type: MediaType;
  name?: string;
  size?: string;
}

export interface Tweet {
  _id: string;
  user_id: string;
  type: TweetType;
  audience: TweetAudienceType;
  content: string;
  parent_id: string | null;
  hashtags: string[];
  mentions: string[];
  medias: Media[];
  user_views: number;
  guest_views: number;
  like: number;
  bookmark: number;
  created_at: string;
  updated_at: string;
  parent_tweet?: Tweet | null;
  // populated fields
  user?: Author & { _id?: string }; // _id từ server, id được normalize ở helper
  isFollowing?: boolean; // shorthand = user.isFollowing
  is_following?: boolean; // snake_case alias từ server
}

export interface CreateTweetBody {
  content: string;
  type: TweetType;
  audience: TweetAudienceType;
  parent_id?: string | null;
  hashtags?: string[];
  mentions?: string[];
  medias?: Media[];
}
