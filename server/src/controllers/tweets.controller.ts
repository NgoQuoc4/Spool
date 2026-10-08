import tweetsService from "~/services/tweets.service";
import { Request, Response } from "express";
import { TokenPayload } from "~/models/requests/User.requests";

export const createTweetController = async (req: Request, res: Response) => {
  const { body } = req;
  const { user_id } = req.decoded_authorization as any;
  const result = await tweetsService.createTweet(body, user_id);
  return res.json({
    message: "Tweet created successfully",
    data: result,
  });
};

export const deleteTweetController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await tweetsService.deleteTweet(tweet_id as string, user_id);
  return res.json({
    message: "Tweet deleted successfully",
    data: result,
  });
};

export const getTweetController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await tweetsService.getTweet(
    tweet_id as string,
    user_id as string,
  );
  return res.json({
    message: "Tweet fetched successfully",
    data: result,
  });
};

export const getAllTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { limit = 10, page = 1, author_id } = req.query;
  const { tweets, total, ...pagination } = await tweetsService.getAllTweet(
    Number(limit),
    Number(page),
    user_id,
    author_id as string,
  );
  const total_pages = Math.ceil(total / Number(limit));
  return res.json({
    message: "Tweets fetched successfully",
    result: {
      tweets,
      total,
      page: Number(page),
      limit: Number(limit),
      total_page: total_pages,
    },
    data: tweets,
    pagination: {
      ...pagination,
      total,
      total_pages,
      page: Number(page),
      limit: Number(limit),
    },
  });
};
