import { ObjectId } from "mongodb";
import { EncodeStatus } from "~/constants/enums";

interface VideoStatusType {
  _id?: ObjectId;
  name: string;
  status: EncodeStatus;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class VideoStatus {
  _id: ObjectId;
  name: string;
  status: EncodeStatus;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(videoStatus: VideoStatusType) {
    this._id = videoStatus._id || new ObjectId();
    this.name = videoStatus.name;
    this.status = videoStatus.status;
    this.message = videoStatus.message || "";
    this.createdAt = videoStatus.createdAt || new Date();
    this.updatedAt = videoStatus.updatedAt || new Date();
  }
}
