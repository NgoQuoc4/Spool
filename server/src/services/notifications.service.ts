import { NotificationType } from "@prisma/client";
import prisma from "./prisma.service";
import { io, users } from "..";

function formatNotification(n: any) {
  if (!n) return n;
  return {
    id: n.id,
    type: n.type,
    content: n.content,
    senderId: n.sender_id,
    receiverId: n.receiver_id,
    tweetId: n.tweet_id,
    isRead: n.is_read,
    createdAt: n.created_at,
    sender: n.sender,
    tweet: n.tweet,
  };
}

class NotificationService {
  async createNotification(data: {
    senderId: string;
    receiverId: string;
    type: NotificationType;
    tweetId?: string;
    content?: string;
  }) {
    const { senderId, receiverId, tweetId, content, type } = data;

    if (!senderId || !receiverId) return null;
    if (senderId === receiverId) return null;

    const notif = await prisma.notification.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        type,
        tweet_id: tweetId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        tweet: { select: { id: true, content: true } },
      },
    });

    const formatted = formatNotification(notif);
    const receiverSocketId = users[receiverId];
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("new-notification", formatted);
    }

    return formatted;
  }

  async getNotifications(
    user_id: string,
    limit: number = 10,
    offset: number = 0,
  ) {
    const notifs = await prisma.notification.findMany({
      where: { receiver_id: user_id },
      include: { sender: true, tweet: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });
    return notifs.map(formatNotification);
  }

  async countUnreadNotifications(user_id: string) {
    return prisma.notification.count({
      where: { receiver_id: user_id, is_read: false },
    });
  }

  async readNotification(id: string) {
    const notif = await prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
    return formatNotification(notif);
  }

  async deleteNotification(tweet_id: string) {
    return prisma.notification.deleteMany({
      where: { tweet_id: tweet_id },
    });
  }
}
export const notificationService = new NotificationService();
export default notificationService;
