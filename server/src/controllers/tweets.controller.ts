import tweetsService from "~/services/tweets.service";
import { Request, Response } from "express";
import { TokenPayload } from "~/models/requests/User.requests";
import botsService from "~/services/bots.service";
import { ok, created, paginated } from "~/utils/api.response";

export const createTweetController = async (req: Request, res: Response) => {
  const { body } = req;
  const { user_id } = req.decoded_authorization as any;
  const data = await tweetsService.createTweet(body, user_id);
  return created(res, data, "Tweet created successfully");
};

export const autoPostTweetController = async (req: Request, res: Response) => {
  const botId = (req.body?.bot_id || req.query?.bot_id) as string | undefined;
  const data = await botsService.autoPostLatestNews(botId);
  return created(res, data, "Tweet created successfully");
};

export const deleteTweetController = async (req: Request, res: Response) => {
  const tweet_id = (req.params.tweetId || req.params.tweet_id) as string;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const data = await tweetsService.deleteTweet(tweet_id, user_id);
  return ok(res, data, "Tweet deleted successfully");
};

export const getTweetController = async (req: Request, res: Response) => {
  const tweet_id = (req.params.tweetId || req.params.tweet_id) as string;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const data = await tweetsService.getTweet(tweet_id, user_id as string);
  return ok(res, data, "Tweet fetched successfully");
};

export const getAllTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const author_id = (req.query.authorId ?? req.query.author_id) as string | undefined;
  const following_only = (req.query.followingOnly ?? req.query.following_only) as string | undefined;
  const liked_only = (req.query.likedOnly ?? req.query.liked_only) as string | undefined;
  const bookmark_only = (req.query.bookmarkOnly ?? req.query.bookmark_only) as string | undefined;

  const { tweets, total } = await tweetsService.getAllTweet(
    limit,
    page,
    user_id,
    author_id as string,
    following_only as string,
    liked_only as string,
    bookmark_only as string,
  );

  return paginated(res, tweets, { page, limit, total }, "Tweets fetched successfully");
};

export const getTweetChildrenController = async (req: Request, res: Response) => {
  const tweet_id = (req.params.tweetId || req.params.tweet_id) as string;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const currentUserId = req.decoded_authorization?.user_id as string;
  const { tweets, total } = await tweetsService.getTweetChildren(
    tweet_id,
    limit,
    page,
    currentUserId as string,
  );
  return paginated(res, tweets, { page, limit, total }, "Tweet children fetched successfully");
};

export const unretweetController = async (req: Request, res: Response) => {
  const tweet_id = (req.params.tweetId || req.params.tweet_id) as string;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const data = await tweetsService.unretweet(tweet_id, user_id);
  return ok(res, data, "Retweet removed successfully");
};
