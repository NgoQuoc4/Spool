import { MediaType } from "~/constants/enums";

export enum TweetType {
  TWEET = "tweet",
  RETWEET = "retweet",
  QUOTETWEET = "quote",
  COMMENT = "comment",
  COMMENT_RETWEET = "comment_retweet",
  COMMENT_QUOTETWEET = "comment_quotetweet",
  // Lowercase aliases matching Prisma
  tweet = "tweet",
  retweet = "retweet",
  quote = "quote",
  comment = "comment",
  comment_retweet = "comment_retweet",
  comment_quotetweet = "comment_quotetweet",
}

export enum TweetAudienceType {
  EVERYONE = "everyone",
  FOLLOWING = "following",
  FOLLOWING_AND_MEDIA = "following_and_media",
  MENTIONED_USERS = "mentioned_users",
  TWEET_CIRCLE = "tweet_circle",
  TWEET_CRICLE = "tweet_circle", // typo alias backward compatibility
  // Lowercase aliases matching Prisma
  everyone = "everyone",
  following = "following",
  following_and_media = "following_and_media",
  mentioned_users = "mentioned_users",
  tweet_circle = "tweet_circle",
}

export interface Media {
  url: string;
  type: MediaType | string;
  name?: string;
  size?: string;
}

export interface ITweet {
  id?: string;
  user_id?: string;
  type: TweetType;
  audience: TweetAudienceType;
  content: string;
  parent_id?: null | string;
  hashtags: string[];
  mentions: string[];
  medias: Media[];
  user_views?: number;
  guest_views?: number;
  like?: number;
  bookmark?: number;
  created_at?: Date;
  updated_at?: Date;
}
