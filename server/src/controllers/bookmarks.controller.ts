import { NextFunction, Request, Response } from "express";
import { userMessage } from "~/constants/messages";
import { TokenPayload } from "~/models/requests/User.requests";
import bookmarkService from "~/services/bookmarks.service";
import { ok } from "~/utils/api.response";

export const bookmarkController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user_id = (req.decoded_authorization as TokenPayload).user_id;
  const tweet_id = req.body.tweetId as string;
  const data = await bookmarkService.bookmarkTweet(user_id, tweet_id);
  return ok(res, data, userMessage.BOOKMARK_SUCCESS);
};
