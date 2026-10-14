import { Router } from "express";
import { searchController } from "~/controllers/searchs.controller";
import { wrapAsync } from "~/utils/handles";

const searchsRouter = Router();

searchsRouter.get("", wrapAsync(searchController));

export default searchsRouter;
