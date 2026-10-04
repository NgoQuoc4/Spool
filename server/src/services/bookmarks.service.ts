import { ObjectId } from "mongodb";
import dataservice from "./database.service";
import { Bookmark } from "~/models/schemas/Bookmarks.schema";

class bookmarkService {
  private countBookmark(tweet_id: string, operator: "increase" | "decrease") {
    return dataservice.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id),
      },
      {
        $inc: {
          bookmark: operator == "increase" ? 1 : -1,
        },
      },
      {
        returnDocument: "after",
      },
    );
  }
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const unbookmark = await dataservice.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id),
    });
    if (unbookmark) {
      await this.countBookmark(tweet_id, "decrease");
      return {
        message: "Unbookmark success",
        bookmark: unbookmark,
      };
    }
    const bookmark = await dataservice.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id),
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id),
        }),
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
    await this.countBookmark(tweet_id, "increase");
    return {
      message: "Bookmark success",
      bookmark: bookmark,
    };
  }
}

export default new bookmarkService();
