import { ObjectId } from "mongodb";

export enum TweetType {
  TWEET = "tweet",
  RETWEET = "retweet",
  QUOTETWEET = "quote",
  COMMENT = "comment",
  COMMENT_RETWEET = "comment_retweet",
  COMMENT_QUOTETWEET = "comment_quotetweet",
}
export enum TweetAudienceType {
  EVERYONE = "everyone",
  FOLLOWING = "following",
  FOLLOWING_AND_MEDIA = "following_and_media",
  MENTIONED_USERS = "mentioned_users",
  TWEET_CRICLE = "tweet_circle",
}
export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  HLS = "hls",
  FILE = "file",
}
export interface Media {
  url: string;
  type: MediaType;
  name?: string;
  size?: string;
}
export interface ITweetType {
  _id?: ObjectId;
  user_id?: ObjectId;
  type: TweetType;
  audience: TweetAudienceType;
  content: string;
  parent_id?: null | ObjectId;
  hashtags: ObjectId[];
  mentions: ObjectId[]; // user_id[]
  medias: Media[];
  user_views?: number;
  guest_views?: number;
  like?: number;
  bookmark?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class Tweet implements ITweetType {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudienceType;
  content: string;
  parent_id?: null | ObjectId;
  hashtags: ObjectId[];
  mentions: ObjectId[]; // user_id[]
  medias: Media[];
  user_views?: number;
  guest_views?: number;
  like?: number;
  bookmark?: number;
  created_at?: Date;
  updated_at?: Date;
  constructor(Tweet: ITweetType) {
    this._id = Tweet._id || new ObjectId();
    this.user_id = Tweet.user_id || new ObjectId();
    this.type = Tweet.type || TweetType.TWEET;
    this.audience = Tweet.audience || TweetAudienceType.EVERYONE;
    this.content = Tweet.content || "";
    this.parent_id = Tweet.parent_id || null;
    this.hashtags = Tweet.hashtags || [];
    this.mentions = Tweet.mentions || [];
    this.medias = Tweet.medias || [];
    this.user_views = Tweet.user_views || 0;
    this.guest_views = Tweet.guest_views || 0;
    this.like = Tweet.like || 0;
    this.bookmark = Tweet.bookmark || 0;
    this.created_at = Tweet.created_at || new Date();
    this.updated_at = Tweet.updated_at || new Date();
  }
}
