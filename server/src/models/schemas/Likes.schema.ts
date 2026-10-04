import { ObjectId } from "mongodb";

interface LikeType {
  _id?: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at?: Date;
}

export class Like implements LikeType {
  _id?: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at?: Date;
  constructor({ user_id, tweet_id, created_at, _id }: LikeType) {
    this._id = _id || new ObjectId();
    this.user_id = user_id;
    this.tweet_id = tweet_id;
    this.created_at = created_at || new Date();
  }
}
