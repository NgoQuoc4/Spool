import { ObjectId } from "mongodb";

interface BookmarkType {
  _id?: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at?: Date;
}

export class Bookmark implements BookmarkType {
  _id?: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at?: Date;
  constructor({ user_id, tweet_id, created_at, _id }: BookmarkType) {
    this._id = _id || new ObjectId();
    this.user_id = user_id;
    this.tweet_id = tweet_id;
    this.created_at = created_at || new Date();
  }
}
