import { Collection, Db, MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";
import User from "~/models/schemas/User.schema";
import { RefreshToken } from "~/models/schemas/RefreshToken.schema";
import { Follow } from "~/models/schemas/Follow.schema";
import VideoStatus from "~/models/schemas/VideoStatus.schema";
import { Tweet } from "~/models/schemas/Tweet.schema";
import { Hashtag } from "~/models/schemas/Hashtags.schema";
import { Bookmark } from "~/models/schemas/Bookmarks.schema";
import { Like } from "~/models/schemas/Likes.schema";

const uri = process.env.MONGO_URI || "";

class DatabaseService {
  private client: MongoClient;
  private db: Db;
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME);
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!",
      );
    } catch (error) {
      console.log(error);
      await this.client.close();
    }
  }

  async indexUser() {
    const exist = await this.users.indexExists([
      "email_1_passwpord_1",
      "email_1",
      "username_1",
      "reset_password_token_1",
      "forgot_password_token_1",
    ]);
    if (!exist) {
      this.users.createIndex({ email: 1, passwpord: 1 });
      this.users.createIndex({ email: 1 }, { unique: true });
      this.users.createIndex({ username: 1 }, { unique: true });
      this.users.createIndex({ reset_password_token: 1 });
      this.users.createIndex({ forgot_password_token: 1 });
    }
  }
  async indexRefreshToken() {
    const exist = await this.refreshTokens.indexExists([
      "token_1",
      "user_id_1",
      "exp_1",
    ]);
    if (!exist) {
      this.refreshTokens.createIndex({ token: 1 });
      this.refreshTokens.createIndex({ user_id: 1 });
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
    }
  }
  async indexFollows() {
    const exist = await this.follows.indexExists([
      "user_id_1",
      "followed_user_id_1",
      "user_id_1_followed_user_id_1",
    ]);
    if (!exist) {
      this.follows.createIndex({ user_id: 1 });
      this.follows.createIndex({ followed_user_id: 1 });
      this.follows.createIndex(
        { user_id: 1, followed_user_id: 1 },
        { unique: true },
      );
    }
  }
  async indexVideoStatus() {
    const exist = await this.videoStatuses.indexExists(["name_1"]);
    if (!exist) {
      this.videoStatuses.createIndex({ name: 1 }, { unique: true });
    }
  }
  async indexBookmarks() {
    const exist = await this.bookmarks.indexExists([
      "user_id_1",
      "tweet_id_1",
      "user_id_1_tweet_id_1",
    ]);
    if (!exist) {
      this.bookmarks.createIndex({ user_id: 1 });
      this.bookmarks.createIndex({ tweet_id: 1 });
      this.bookmarks.createIndex({ user_id: 1, tweet_id: 1 }, { unique: true });
    }
  }
  async indexLikes() {
    const exist = await this.likes.indexExists([
      "user_id_1",
      "liked_user_id_1",
      "user_id_1_liked_user_id_1",
    ]);
    if (!exist) {
      this.likes.createIndex({ user_id: 1 });
      this.likes.createIndex({ liked_user_id: 1 });
      this.likes.createIndex(
        { user_id: 1, liked_user_id: 1 },
        { unique: true },
      );
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string);
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(
      process.env.DB_REFRESH_TOKEN_COLLECTION as string,
    );
  }

  get follows(): Collection<Follow> {
    return this.db.collection(process.env.DB_FOLLOW_COLLECTION as string);
  }

  get videoStatuses(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string);
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEET_COLLECTION as string);
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAG_COLLECTION as string);
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARK_COLLECTION as string);
  }

  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKE_COLLECTION as string);
  }
}

//tạo object từ class dataservice
const dataservice = new DatabaseService();

export default dataservice;
