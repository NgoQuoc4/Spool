import { NextFunction, Request, Response } from "express";
import { userMessage } from "~/constants/messages";
import { TokenPayload } from "~/models/requests/User.requests";
import likeService from "~/services/likes.service";

export const likeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user_id = (req.decoded_authorization as TokenPayload).user_id;
  const tweet_id = req.body.tweet_id as string;
  const result = await likeService.likeTweet(user_id, tweet_id);
  return res.json({
    message: userMessage.LIKE_SUCCESS,
    data: result,
  });
};
