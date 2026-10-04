import { Router } from "express";
import {
  createTweetController,
  getAllTweetController,
  getTweetController,
} from "~/controllers/tweets.controller";
import { filterMiddleware } from "~/middlewares/common.midlewares";
import {
  tweetsValidator,
  tweetValidator,
} from "~/middlewares/likes.middlewares";
import { createTweetValidator } from "~/middlewares/tweets.middlewares";
import { accessTokenValidator } from "~/middlewares/users.middlewares";
import { wrapAsync } from "~/utils/handles";

const tweetsRouter = Router();
/*
 * Description, create a new tweet
 * Path: /tweets/create-tweet
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {content: string, type: string, parent_id: string (tweet_id gốc), quoted_tweet_id: string}
 * Response: {message: string, result: {user: User}}
 */
tweetsRouter.post(
  "/create-tweet",
  accessTokenValidator,
  createTweetValidator,
  wrapAsync(createTweetController),
);

/*
 * Description, get all tweets
 * Path: /tweets/:tweet_id
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Response: {message: string, result: {tweet: Tweet}}
 */
tweetsRouter.get(
  "/:tweet_id",
  accessTokenValidator,
  tweetValidator,
  wrapAsync(getTweetController),
);

/*
 * Description, get all tweets
 * Path: /tweets
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number, page: number}
 * Response: {message: string, result: {tweets: Tweet[]}}
 */
tweetsRouter.get(
  "",
  accessTokenValidator,
  tweetsValidator,
  wrapAsync(getAllTweetController),
);

export default tweetsRouter;
