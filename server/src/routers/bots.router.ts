import { Router } from "express";
import {
  autoPostBotController,
  botsController,
  getBotSettingByIdController,
  updateBotSettingsController,
} from "~/controllers/bots.controller";
import { isAdminValidator } from "~/middlewares/role.midlewares";
import { accessTokenValidator } from "~/middlewares/users.middlewares";
import { wrapAsync } from "~/utils/handles";

const botsRouter = Router();
/*
 * Description, get all tweets
 * Path: /tweets
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number, page: number}
 * Response: {message: string, result: {tweets: Tweet[]}}
 */
botsRouter.get(
  "",
  accessTokenValidator,
  isAdminValidator,
  wrapAsync(botsController),
);

/*
 * Description, create a new tweet
 * Path: /tweets/create-tweet
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {content: string, type: string, parent_id: string (tweet_id gốc), quoted_tweet_id: string}
 * Response: {message: string, result: {user: User}}
 */
botsRouter.post(
  "/auto-post",
  accessTokenValidator,
  isAdminValidator,
  wrapAsync(autoPostBotController),
);

/*
 * Description, create a new tweet
 * Path: /tweets/create-tweet
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {content: string, type: string, parent_id: string (tweet_id gốc), quoted_tweet_id: string}
 * Response: {message: string, result: {user: User}}
 */

botsRouter.get(
  "/settings/:bot_id",
  accessTokenValidator,
  isAdminValidator,
  wrapAsync(getBotSettingByIdController),
);

/*
 * Description, create a new tweet
 * Path: /tweets/create-tweet
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {content: string, type: string, parent_id: string (tweet_id gốc), quoted_tweet_id: string}
 * Response: {message: string, result: {user: User}}
 */

botsRouter.patch(
  "/settings/:bot_id",
  accessTokenValidator,
  isAdminValidator,
  wrapAsync(updateBotSettingsController),
);

export default botsRouter;
