import { Router } from "express";
import { searchController } from "~/controllers/searchs.controller";
import { optionalAccessTokenValidator } from "~/middlewares/users.middlewares";
import { wrapAsync } from "~/utils/handles";

const searchsRouter = Router();

searchsRouter.get("", optionalAccessTokenValidator, wrapAsync(searchController));

export default searchsRouter;
