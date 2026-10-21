import { Router } from "express";
import {
  hastagController,
  searchController,
} from "~/controllers/searchs.controller";
import { optionalAccessTokenValidator } from "~/middlewares/users.middlewares";
import { wrapAsync } from "~/utils/handles";

const searchsRouter = Router();

searchsRouter.get(
  "",
  optionalAccessTokenValidator,
  wrapAsync(searchController),
);
searchsRouter.get(
  "/hastag",
  optionalAccessTokenValidator,
  wrapAsync(hastagController),
);
export default searchsRouter;
