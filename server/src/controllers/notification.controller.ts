import { NextFunction, Request, Response } from "express";
import notificationService from "~/services/notifications.service";
import { ok, created } from "~/utils/api.response";

export const createNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  const notification = await notificationService.createNotification(req.body);
  return created(res, notification, "Notification sent successfully");
};

export const getNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id as string;
  const limit = Number(req.query.limit);
  const offset = Number(req.query.offset);
  const data = await notificationService.getNotifications(userId, limit, offset);
  return ok(res, data, "Notifications fetched successfully");
};

export const countUnreadNotificationsController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id as string;
  const data = await notificationService.countUnreadNotifications(userId);
  return ok(res, data, "Unread notifications count fetched successfully");
};

export const readNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  return ok(res, null, "Notification read successfully");
};

export const readAllNotificationsController = async (req: Request, res: Response, next: NextFunction) => {
  return ok(res, null, "Notifications read successfully");
};

export const deleteNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  const tweet_id = req.params.tweet_id as string;
  const data = await notificationService.deleteNotification(tweet_id);
  return ok(res, data, "Notification deleted successfully");
};
