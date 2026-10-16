import { Media, TweetAudienceType, TweetType } from "~/types/tweet.types";

export interface TweetRequestBody {
  type: TweetType; // tweet, retwee
  audience: TweetAudienceType; // everyone, following, following_and_media, mentioned_users
  content: string; // ""
  hashtags: string[]; // ["js", "java"]
  mentions: string[]; // user_id[] là user_id của người được mention
  medias: Media[]; // list of media objects
  parent_id?: null | string; // chỉ null khi tweet gốc
}
