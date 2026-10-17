import { Router } from "express";
import {
  countUnreadNotificationsController,
  notificationController,
  readAllNotificationsController,
  readNotificationController,
} from "~/controllers/notification.controller";
import { accessTokenValidator } from "~/middlewares/users.middlewares";
import { wrapAsync } from "~/utils/handles";

const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  accessTokenValidator,
  wrapAsync(notificationController),
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
export default notificationsRouter;
