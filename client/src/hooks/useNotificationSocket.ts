import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useAppStore } from "@/stores/useAppStore";
import { useQueryClient } from "@tanstack/react-query";

const useNotificationSocket = () => {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();

  useSocketEvent("new-notification", (newNotif: any) => {
    console.log("🔔 Nhận thông báo mới realtime:", newNotif);

    // Hiển thị Popup Toast thông báo nổi ở góc màn hình
    const senderName =
      newNotif?.sender?.name || newNotif?.sender?.username || "Ai đó";
    let actionMsg = "đã tương tác với bạn";

    if (newNotif.type === "like") actionMsg = "đã thích bài viết của bạn";
    if (newNotif.type === "comment")
      actionMsg = "đã bình luận về bài viết của bạn";
    if (newNotif.type === "repost")
      actionMsg = "đã đăng lại bài viết của bạn";
    if (newNotif.type === "follow") actionMsg = "đã bắt đầu theo dõi bạn";

    showToast(`🔔 ${senderName} ${actionMsg}`);

    // Cập nhật ngay danh sách Activity nếu đang mở mà không cần F5
    queryClient.setQueryData(["notifications"], (oldData: any) => {
      if (!oldData) return oldData;
      const currentList = Array.isArray(oldData?.data?.data)
        ? oldData.data.data
        : Array.isArray(oldData?.data)
          ? oldData.data
          : [];
      return {
        ...oldData,
        data: {
          ...oldData?.data,
          data: [newNotif, ...currentList],
        },
      };
    });

    // Tăng count unread
    queryClient.invalidateQueries({
      queryKey: ["unread-notifications-count"],
    });
  });
};

export default useNotificationSocket;

