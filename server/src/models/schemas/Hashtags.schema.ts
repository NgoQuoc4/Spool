import { ObjectId } from "mongodb";
export interface HashtagType {
  _id?: ObjectId;
  name: string; // không có dấu #
  created_at?: Date;
}

export class Hashtag implements HashtagType {
  _id?: ObjectId;
  name: string;
  created_at?: Date;
  constructor(name: string, _id?: ObjectId, created_at?: Date) {
    this._id = _id || new ObjectId();
    this.name = name;
    this.created_at = created_at || new Date();
  }
}
