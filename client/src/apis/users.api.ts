import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";
import type { User, UpdateMeBody } from "@/types/user.types";
import type { ApiSuccess } from "@/types/api.types";

export const usersApi = {
  getProfile: (username: string) =>
    http.get<ApiSuccess<User>>(ENDPOINTS.PROFILE(username)),

  getMe: () => http.get<ApiSuccess<User>>(ENDPOINTS.ME),

  updateMe: (body: UpdateMeBody) =>
    http.patch<ApiSuccess<User>>(ENDPOINTS.ME, body),

  follow: (followedUserId: string) =>
    http.post(ENDPOINTS.FOLLOW, { followedUserId }),

  unfollow: (followedUserId: string) =>
    http.delete(ENDPOINTS.FOLLOW, { data: { followedUserId } }),

  changePassword: (body: {
    oldPassword: string;
    password: string;
    confirmPassword: string;
  }) => http.put(ENDPOINTS.CHANGE_PASSWORD, body),

  verifyEmail: (email_verify_token: string) =>
    http.post(ENDPOINTS.VERIFY_EMAIL, { email_verify_token }),

  resendVerifyEmail: (email: string) =>
    http.post(ENDPOINTS.RESEND_VERIFY_EMAIL, { email }),

  following: (username: string) =>
    http.get<ApiSuccess<User[]>>(ENDPOINTS.FOLLOWING(username)),

  followers: (username: string) =>
    http.get<ApiSuccess<User[]>>(ENDPOINTS.FOLLOWERS(username)),

  getMessages: (
    receiver_id: string,
    params?: { limit?: number; cursor?: string },
  ) =>
    http.get<ApiSuccess<any[]>>(
      ENDPOINTS.CONVERSATIONS_MESSAGES(receiver_id),
      { params },
    ),

  getConversations: () =>
    http.get<ApiSuccess<any[]>>(ENDPOINTS.CONVERSATIONS),

  deleteConversation: (receiver_id: string) =>
    http.delete<ApiSuccess<null>>(ENDPOINTS.CONVERSATIONS_DELETE(receiver_id)),
};
