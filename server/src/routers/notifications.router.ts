import { Router } from "express";
import {
  countUnreadNotificationsController,
  getNotificationController,
  readAllNotificationsController,
  readNotificationController,
  createNotificationController,
  deleteNotificationController,
} from "~/controllers/notification.controller";
import { accessTokenValidator } from "~/middlewares/users.middlewares";
import { wrapAsync } from "~/utils/handles";

const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  accessTokenValidator,
  wrapAsync(getNotificationController),
);

notificationsRouter.post(
  "/create-notification",
  accessTokenValidator,
  wrapAsync(createNotificationController),
);

notificationsRouter.get(
  "/unread-count",
  accessTokenValidator,
  wrapAsync(countUnreadNotificationsController),
);
notificationsRouter.patch(
  "/:id/read",
  accessTokenValidator,
  wrapAsync(readNotificationController),
);
notificationsRouter.patch(
  "/read-all",
  accessTokenValidator,
  wrapAsync(readAllNotificationsController),
);
notificationsRouter.delete(
  "/:tweet_id/delete",
  accessTokenValidator,
  wrapAsync(deleteNotificationController),
);
export default notificationsRouter;
