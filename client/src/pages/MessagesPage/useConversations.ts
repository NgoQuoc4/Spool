import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usersApi } from "@/apis/users.api";
import type { Conversation } from "./types";

export const useConversations = (profileId?: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);

  // ============================================================
  // Lấy danh sách người trò chuyện từ lịch sử tin nhắn
  // ============================================================
  useEffect(() => {
    if (!profileId) return;

    const fetchConversations = async () => {
      try {
        const response = await usersApi.getConversations();
        const contacts = response.data.result.map((item: any) => ({
          followed_user_id: item.user_id,
          user_id: item.user_id,
          name: item.name,
          username: item.username,
          avatar: item.avatar,
          lastMessage: item.lastMessage,
          time: item.lastMessageAt
            ? new Date(item.lastMessageAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        }));

        // Giữ lại conversations tạm thời (chưa có trong DB) như khi mở từ ProfilePage
        setConversations((prev) => {
          const unsaved = prev.filter(
            (p) => !contacts.some((c: any) => c.user_id === p.user_id),
          );
          return [...unsaved, ...contacts];
        });

        // Đồng bộ lại activeChat với thông tin chi tiết từ DB (nếu có)
        setActiveChat((current) => {
          if (!current) return current;
          const match = contacts.find(
            (c: any) => c.user_id === current.user_id,
          );
          return match ? { ...current, ...match } : current;
        });
      } catch (error) {
        console.error("Lỗi tải danh sách hội thoại:", error);
      }
    };

    fetchConversations();
  }, [profileId]);

  // ============================================================
  // Xử lý deep-link từ ProfilePage (?userId=<id>)
  // Khi user bấm "Message" trên trang profile → tự động mở chat
  // ============================================================
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (!targetUserId || !profileId || targetUserId === profileId) return;

    const targetContact: Conversation = {
      followed_user_id: targetUserId,
      user_id: targetUserId,
      name: searchParams.get("name") || "User",
      username: searchParams.get("username") || "",
      avatar: searchParams.get("avatar") || "",
    };

    setConversations((prev) => {
      const existing = prev.find((c) => c.user_id === targetUserId);
      if (existing) {
        return [existing, ...prev.filter((c) => c.user_id !== targetUserId)];
      }
      return [targetContact, ...prev];
    });

    setActiveChat((current) => {
      if (current?.user_id === targetUserId) return current;
      return targetContact;
    });

    // Xóa ?userId khỏi URL để URL gọn gàng
    setSearchParams({}, { replace: true });
  }, [searchParams, profileId, setSearchParams]);

  // ============================================================
  // Cập nhật preview tin nhắn cuối ở sidebar (gọi từ ngoài)
  // ============================================================
  const updateConversationPreview = (
    userId: string,
    lastMessage: string,
    time: string,
  ) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.followed_user_id === userId || c.user_id === userId
          ? { ...c, lastMessage, time }
          : c,
      ),
    );
  };

  // ============================================================
  // Bắt đầu cuộc hội thoại mới từ modal
  // ============================================================
  const startNewChat = (selectedUser: any, currentProfileId?: string) => {
    const targetId = selectedUser?.id || selectedUser?._id;
    if (!targetId || !currentProfileId || targetId === currentProfileId) return;

    const existing = conversations.find(
      (c) => c.followed_user_id === targetId || c.user_id === targetId,
    );

    let target: Conversation;
    if (existing) {
      target = existing;
      setConversations((prev) => [
        existing,
        ...prev.filter(
          (c) => c.followed_user_id !== targetId && c.user_id !== targetId,
        ),
      ]);
    } else {
      target = {
        followed_user_id: targetId,
        user_id: targetId,
        avatar: selectedUser.avatar || "",
        name:
          selectedUser.name ||
          selectedUser.username ||
          `User ${targetId.slice(-4)}`,
        username: selectedUser.username || `user_${targetId.slice(-6)}`,
        lastMessage: "New conversation",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setConversations((prev) => [target, ...prev]);
    }

    setActiveChat(target);
  };

  // ============================================================
  // Xóa hội thoại (cả UI và API)
  // ============================================================
  const deleteConversation = async (
    e: React.MouseEvent,
    targetUserId: string,
  ) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;

    try {
      await usersApi.deleteConversation(targetUserId);

      setConversations((prev) =>
        prev.filter(
          (c) =>
            c.followed_user_id !== targetUserId &&
            c.user_id !== targetUserId,
        ),
      );

      setActiveChat((current) => {
        if (
          current?.followed_user_id === targetUserId ||
          current?.user_id === targetUserId
        )
          return null;
        return current;
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return {
    conversations,
    activeChat,
    setActiveChat,
    updateConversationPreview,
    startNewChat,
    deleteConversation,
  };
};

export default useConversations;
