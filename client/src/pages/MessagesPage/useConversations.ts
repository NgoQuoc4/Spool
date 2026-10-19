import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usersApi } from "@/apis/users.api";
import type { Conversation } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useConversations = (profileId?: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const queryClient = useQueryClient();

  // ============================================================
  // 1. Tải danh sách hội thoại từ API bằng useQuery
  // ============================================================
  const { data: convResponse, isLoading } = useQuery({
    queryKey: ["conversations", profileId],
    queryFn: () => usersApi.getConversations(),
    enabled: Boolean(profileId),
  });

  // Đồng bộ danh sách hội thoại từ Query Cache vào state
  useEffect(() => {
    if (!convResponse?.data?.data) return;

    const contacts: Conversation[] = convResponse.data.data.map((item: any) => {
      const id = item.userId;
      return {
        userId: id,
        followedUserId: id,
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
      };
    });

    // Giữ lại conversations tạm thời (chưa có trong DB) như khi mở từ ProfilePage
    setConversations((prev) => {
      const unsaved = prev.filter(
        (p) => !contacts.some((c: any) => c.userId === p.userId),
      );
      return [...unsaved, ...contacts];
    });

    // Đồng bộ lại activeChat với thông tin chi tiết từ DB (nếu có)
    setActiveChat((current) => {
      if (!current) return current;
      const match = contacts.find((c: any) => c.userId === current.userId);
      return match ? { ...current, ...match } : current;
    });
  }, [convResponse]);

  // ============================================================
  // Xử lý deep-link từ ProfilePage (?userId=<id>)
  // Khi user bấm "Message" trên trang profile → tự động mở chat
  // ============================================================
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (!targetUserId || !profileId || targetUserId === profileId) return;

    const targetContact: Conversation = {
      userId: targetUserId,
      followedUserId: targetUserId,
      name: searchParams.get("name") || "User",
      username: searchParams.get("username") || "",
      avatar: searchParams.get("avatar") || "",
    };

    setConversations((prev) => {
      const existing = prev.find((c) => c.userId === targetUserId);
      if (existing) {
        return [existing, ...prev.filter((c) => c.userId !== targetUserId)];
      }
      return [targetContact, ...prev];
    });

    setActiveChat((current) => {
      if (current?.userId === targetUserId) return current;
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
        c.userId === userId || c.followedUserId === userId
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
      (c) => c.userId === targetId || c.followedUserId === targetId,
    );

    let target: Conversation;
    if (existing) {
      target = existing;
      setConversations((prev) => [
        existing,
        ...prev.filter(
          (c) => c.userId !== targetId && c.followedUserId !== targetId,
        ),
      ]);
    } else {
      target = {
        userId: targetId,
        followedUserId: targetId,
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
  // 2. Xóa cuộc hội thoại bằng useMutation
  // ============================================================
  const deleteMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      usersApi.deleteConversation(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Failed to delete conversation:", error);
    },
  });

  const deleteConversation = (
    e: React.MouseEvent,
    targetUserId: string,
  ) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;

    // Optimistic UI update
    setConversations((prev) =>
      prev.filter(
        (c) =>
          c.userId !== targetUserId &&
          c.followedUserId !== targetUserId,
      ),
    );

    setActiveChat((current) => {
      if (
        current?.userId === targetUserId ||
        current?.followedUserId === targetUserId
      )
        return null;
      return current;
    });

    deleteMutation.mutate(targetUserId);
  };

  return {
    conversations,
    activeChat,
    setActiveChat,
    updateConversationPreview,
    startNewChat,
    deleteConversation,
    isLoading,
  };
};

export default useConversations;
