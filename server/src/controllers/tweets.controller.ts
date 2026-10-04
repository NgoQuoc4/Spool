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
  const { limit = 10, page = 1 } = req.query;
  const { tweets, total, ...pagination } = await tweetsService.getAllTweet(
    Number(limit),
    Number(page),
    user_id,
  );
  return res.json({
    message: "Tweets fetched successfully",
    data: tweets,
    pagination: {
      ...pagination,
      total,
      total_pages: Math.ceil(total / Number(limit)),
    },
  });
};
