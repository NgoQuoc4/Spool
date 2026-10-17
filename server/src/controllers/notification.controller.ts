import { NextFunction, Request, Response } from "express";
import notificationService from "~/services/notifications.service";

export const createNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body as any;
  const notification = await notificationService.createNotification(data);
  return res.json({
    message: "Notification sent successfully",
    data: notification,
  });
};

export const getNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id as string;
  const limit = Number(req.query.limit);
  const offset = Number(req.query.offset);
  const notifications = await notificationService.getNotifications(
    userId,
    limit,
    offset,
  );
  return res.json({
    message: "Notifications fetched successfully",
    data: notifications,
  });
};

export const countUnreadNotificationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id as string;
  const notifications =
    await notificationService.countUnreadNotifications(userId);
  return res.json({
    message: "Unread notifications count fetched successfully",
    data: notifications,
  });
};

export const readNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id as string;
  const notificationId = req.params.id as string;
  //   const notification = await notificationService.readNotification(
  //     userId,
  //     notificationId,
  //   );
  //   return res.json({
  //     message: "Notification read successfully",
  //     data: notification,
  //   });
  return res.json({
    message: "Notifications read successfully",
  });
};

export const readAllNotificationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id as string;
  //   const notification = await notificationService.readAllNotifications(userId);
  //   return res.json({
  //     message: "Notifications read successfully",
  //     data: notification,
  //   });
  return res.json({
    message: "Notifications read successfully",
  });
};
export const deleteNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tweet_id = req.params.tweet_id as string;
  const notification = await notificationService.deleteNotification(tweet_id);
  return res.json({
    message: "Notifications deleted successfully",
    data: notification,
  });
};
