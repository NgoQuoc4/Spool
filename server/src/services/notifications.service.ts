import { NotificationType } from "@prisma/client";
import prisma from "./prisma.service";
import { io, users } from "..";

class NotificationService {
  async createNotification(data: {
    sender_id: string;
    receiver_id: string;
    type: NotificationType;
    tweet_id?: string;
    content?: string;
  }) {
    console.log("data", data);
    if (data.sender_id === data.receiver_id) return null;
    const notif = await prisma.notification.create({
      data,
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        tweet: { select: { id: true, content: true } },
      },
    });

    const receiverSocketId = users[data.receiver_id];
    console.log("receiverSocketId", receiverSocketId);
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("new-notification", notif);
    }

    return notif;
  }

  async getNotifications(
    user_id: string,
    limit: number = 10,
    offset: number = 0,
  ) {
    return prisma.notification.findMany({
      where: { receiver_id: user_id },
      include: { sender: true, tweet: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });
  }

  async countUnreadNotifications(user_id: string) {
    return prisma.notification.count({
      where: { receiver_id: user_id, is_read: false },
    });
  }

  async readNotification(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async deleteNotification(tweet_id: string) {
    return prisma.notification.deleteMany({
      where: { tweet_id: tweet_id },
    });
  }
}
export const notificationService = new NotificationService();
export default notificationService;
