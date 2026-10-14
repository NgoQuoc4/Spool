import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";
import type { User, UpdateMeBody } from "@/types/user.types";

export const usersApi = {
  getProfile: (username: string) =>
    http.get<{ message: string; result: User }>(ENDPOINTS.PROFILE(username)),

  getMe: () => http.get<{ message: string; result: User }>(ENDPOINTS.ME),

  updateMe: (body: UpdateMeBody) =>
    http.patch<{ message: string; result: User }>(ENDPOINTS.ME, body),

  follow: (followed_user_id: string) =>
    http.post(ENDPOINTS.FOLLOW, { followed_user_id }),

  unfollow: (followed_user_id: string) =>
    http.delete(ENDPOINTS.FOLLOW, { data: { followed_user_id } }),

  changePassword: (body: {
    old_password: string;
    password: string;
    confirm_password: string;
  }) => http.put(ENDPOINTS.CHANGE_PASSWORD, body),

  verifyEmail: (email_verify_token: string) =>
    http.post(ENDPOINTS.VERIFY_EMAIL, { email_verify_token }),

  resendVerifyEmail: (email: string) =>
    http.post(ENDPOINTS.RESEND_VERIFY_EMAIL, { email }),

  following: (username: string) =>
    http.get<{ message: string; result: User[] }>(
      ENDPOINTS.FOLLOWING(username),
    ),

  followers: (username: string) =>
    http.get<{ message: string; result: User[] }>(
      ENDPOINTS.FOLLOWERS(username),
    ),

  getMessages: (
    receiver_id: string,
    params?: { limit?: number; cursor?: string },
  ) =>
    http.get<{ message: string; result: any[] }>(
      ENDPOINTS.CONVERSATIONS_MESSAGES(receiver_id),
      { params },
    ),

  // Lấy danh sách những người đã từng nhắn tin (không phụ thuộc follow)
  getConversations: () =>
    http.get<{ message: string; result: any[] }>(ENDPOINTS.CONVERSATIONS),
};
