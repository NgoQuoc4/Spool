import { Router } from "express";
import { bookmarkController } from "~/controllers/bookmarks.controller";
import { filterMiddleware } from "~/middlewares/common.midlewares";
import { tweetValidator } from "~/middlewares/likes.middlewares";
import { accessTokenValidator } from "~/middlewares/users.middlewares";
import { BookmarkRequestBody } from "~/models/requests/User.requests";
import { wrapAsync } from "~/utils/handles";

const bookmarkRouter = Router();
bookmarkRouter.post(
  "",
  accessTokenValidator,
  filterMiddleware<BookmarkRequestBody>(["tweet_id"]),
  tweetValidator,
  wrapAsync(bookmarkController),
);
export default bookmarkRouter;
