import { ENDPOINTS } from "@/constants/endpoints";
import http from "./http";

export const notifications = {
  createNotification: (data: any) =>
    http.post(ENDPOINTS.CREATE_NOTIFICATION, data),
  getNotifications: () => http.get(ENDPOINTS.GET_NOTIFICATIONS),
  countUnreadNotifications: () =>
    http.get(ENDPOINTS.COUNT_UNREAD_NOTIFICATIONS),
  readNotification: (id: string) => http.patch(ENDPOINTS.READ_NOTIFICATION(id)),
  readAllNotifications: () => http.patch(ENDPOINTS.READ_ALL_NOTIFICATIONS),
  deleteNotification: (tweet_id: string) =>
    http.delete(ENDPOINTS.DELETE_NOTIFICATION(tweet_id)),
};
