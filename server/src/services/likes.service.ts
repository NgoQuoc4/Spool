import { ObjectId } from "mongodb";
import dataservice from "./database.service";
import { Like } from "~/models/schemas/Likes.schema";

class likeService {
  private countLikes(tweet_id: string, operator: "increase" | "decrease") {
    return dataservice.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id),
      },
      {
        $inc: {
          like: operator == "increase" ? 1 : -1,
        },
      },
      {
        returnDocument: "after",
      },
    );
  }

  async likeTweet(user_id: string, tweet_id: string) {
    const unlike = await dataservice.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id),
    });
    if (unlike) {
      await this.countLikes(tweet_id, "decrease");
      return {
        message: "Unlike success",
        like: unlike,
      };
    }
    const like = await dataservice.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id),
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id),
        }),
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
    await this.countLikes(tweet_id, "increase");
    return {
      message: "Like success",
      like: like,
    };
  }
}

export default new likeService();
