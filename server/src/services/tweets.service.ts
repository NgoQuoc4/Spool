import { TweetRequestBody } from "~/models/requests/Tweet.requests";
import dataservice from "./database.service";
import { Tweet } from "~/models/schemas/Tweet.schema";
import { ObjectId } from "mongodb";
import { Hashtag } from "~/models/schemas/Hashtags.schema";
import { set } from "lodash";

class TweetsService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return dataservice.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag(hashtag),
          },
          {
            upsert: true,
            returnDocument: "after",
          },
        );
      }),
    );
    return hashtagDocuments.map(
      (hashtag) => (hashtag as Hashtag)._id as ObjectId,
    );
  }

  async createTweet(body: TweetRequestBody, userId: string) {
    const hashtags = await this.checkAndCreateHashtags(
      body.hashtags as string[],
    );
    const result = await dataservice.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(userId),
        audience: body.audience,
        type: body.type,
        content: body.content,
        hashtags,
        mentions: body.mentions.map((mention) => new ObjectId(mention)),
        medias: body.medias,
        parent_id: body.parent_id ? new ObjectId(body.parent_id) : null,
      }),
    );
    const tweet = await dataservice.tweets.findOne({
      _id: result.insertedId,
    });
    return tweet;
  }

  async getTweet(tweet_id: string, user_id?: string) {
    const tweets = await dataservice.tweets
      .aggregate([
        // 1. Lọc đúng tweet vừa tạo (tương đương findOne filter)
        {
          $match: {
            _id: new ObjectId(tweet_id),
          },
        },
        // 2. Nối bảng users để lấy thông tin tác giả
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  username: 1,
                  email: 1,
                  avatar: 1,
                  cover_photo: 1,
                },
              },
            ],
          },
        },

        // 3. Biến mảng user thành 1 object (vì mỗi tweet chỉ có 1 tác giả)
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true, // Nếu user bị xóa, tweet vẫn trả về
          },
        },
        // 4. Nối bảng hashtags (giữ nguyên dạng mảng)
        {
          $lookup: {
            from: "hashtags",
            localField: "hashtags",
            foreignField: "_id",
            as: "hashtags",
          },
        },
        // 5. Lookup mentions
        {
          $lookup: {
            from: "users",
            localField: "mentions",
            foreignField: "_id",
            as: "mentions",
          },
        },
        // 6. Lookup bookmarks
        {
          $lookup: {
            from: "bookmarks",
            localField: "_id",
            foreignField: "tweet_id",
            as: "bookmarks",
          },
        },
        // 7. Lookup likes để đếm số lượt like
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "tweet_id",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "tweets",
            let: { pid: "$parent_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", { $toObjectId: "$$pid" }],
                  },
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "user_id",
                  foreignField: "_id",
                  as: "user",
                  pipeline: [
                    { $project: { _id: 1, name: 1, username: 1, avatar: 1 } },
                  ],
                },
              },
              { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  user_id: 0,
                  likes: 0,
                  bookmarks: 0,
                },
              },
            ],
            as: "parent_tweet",
          },
        },

        // 8. Thêm các trường đếm likes_count, bookmarks_count và format mentions
        {
          $addFields: {
            likes_count: { $size: "$likes" },
            bookmarks_count: { $size: "$bookmarks" },
            mentions: {
              $map: {
                input: "$mentions",
                as: "mention",
                in: {
                  _id: "$$mention._id",
                  name: "$$mention.name",
                  username: "$$mention.username",
                  email: "$$mention.email",
                },
              },
            },
          },
        }, // 9. Xoá bỏ mảng raw likes và bookmarks (chỉ giữ lại số đếm)
      ])
      .toArray();

    const inc = user_id
      ? {
          user_views: 1,
        }
      : {
          guest_views: 1,
        };

    await dataservice.tweets.updateMany(
      {
        _id: new ObjectId(tweet_id),
      },
      {
        $inc: inc,
        $set: {
          updated_at: new Date(),
        },
      },
    );

    // Lấy ra phần tử đầu tiên tương tự như kết quả findOne
    return tweets[0] || null;
  }

  async getAllTweet(limit: number, page: number, user_id: string) {
    const currentUserId = new ObjectId(user_id);
    // 1. Lấy danh sách ID những người mà user này đang follow
    const followedUsers = await dataservice.follows
      .find(
        { user_id: currentUserId },
        { projection: { followed_user_id: 1, _id: 0 } },
      )
      .toArray();
    const followedUserIds = followedUsers.map((user) => user.followed_user_id);
    // Thêm chính user_id vào danh sách nếu muốn hiển thị cả bài đăng của bản thân trên feed
    const targetUserIds = [...followedUserIds, currentUserId];
    const filterQuery = { user_id: { $in: targetUserIds } };

    const [tweets, total] = await Promise.all([
      dataservice.tweets
        .aggregate([
          { $match: filterQuery },
          { $sort: { created_at: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                    cover_photo: 1,
                  },
                },
              ],
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "hashtags",
              localField: "hashtags",
              foreignField: "_id",
              as: "hashtags",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "mentions",
              foreignField: "_id",
              as: "mentions",
            },
          },
          {
            $lookup: {
              from: "bookmarks",
              localField: "_id",
              foreignField: "tweet_id",
              as: "bookmarks",
            },
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "tweet_id",
              as: "likes",
            },
          },
          {
            $addFields: {
              likes_count: { $size: "$likes" },
              bookmarks_count: { $size: "$bookmarks" },
              mentions: {
                $map: {
                  input: "$mentions",
                  as: "mention",
                  in: {
                    _id: "$$mention._id",
                    name: "$$mention.name",
                    username: "$$mention.username",
                    email: "$$mention.email",
                  },
                },
              },
            },
          },
          { $project: { likes: 0, bookmarks: 0 } },
        ])
        .toArray(),
      dataservice.tweets.countDocuments({}),
    ]);

    return { tweets, total, page, limit };
  }
}

export const tweetsService = new TweetsService();

export default tweetsService;
