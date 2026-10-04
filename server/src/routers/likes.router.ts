import { Router } from "express";
import { likeController } from "~/controllers/likes.controller";
import { filterMiddleware } from "~/middlewares/common.midlewares";
import { tweetValidator } from "~/middlewares/likes.middlewares";
import { accessTokenValidator } from "~/middlewares/users.middlewares";
import { LikeRequestBody } from "~/models/requests/User.requests";
import { wrapAsync } from "~/utils/handles";

const likeRouter = Router();
likeRouter.post(
  "",
  accessTokenValidator,
  filterMiddleware<LikeRequestBody>(["tweet_id"]),
  tweetValidator,
  wrapAsync(likeController),
);
export default likeRouter;
