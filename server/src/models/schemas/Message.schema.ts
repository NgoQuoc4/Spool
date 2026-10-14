// import { ObjectId } from "mongodb";

// interface MessageType {
//   id?: string;
//   sender_id: string;
//   receiver_id: string;
//   content: string;
//   created_at?: Date;
// }

//   id          String   @id @default(cuid())
//   sender_id   String   // Người gửi
//   receiver_id String   // Người nhận
//   content     String   // Nội dung tin nhắn
//   created_at  DateTime @default(now())

// export class Message implements MessageType {
//   _id?: ObjectId;
//   sender_id: ObjectId;
//   receiver_id: ObjectId;
//   content: string;
//   created_at?: Date;
//   constructor({
//     sender_id,
//     receiver_id,
//     content,
//     created_at,
//     _id,
//   }: MessageType) {
//     this._id = _id || new ObjectId();
//     this.sender_id = sender_id;
//     this.receiver_id = receiver_id;
//     this.content = content;
//     this.created_at = created_at || new Date();
//   }
// }
