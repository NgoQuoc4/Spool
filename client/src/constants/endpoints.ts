export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export const ENDPOINTS = {
  // Auth
  SIGN_IN: "/user/sign-in",
  SIGN_UP: "/user/sign-up",
  LOGOUT: "/user/log-out",
  REFRESH_TOKEN: "/user/refresh-token",
  VERIFY_EMAIL: "/user/verify-email",
  RESEND_VERIFY_EMAIL: "/user/resend-verify-email",
  FORGOT_PASSWORD: "/user/forgot-password",
  VERIFY_FORGOT_PASSWORD: "/user/verify-forgot-password-token",
  RESET_PASSWORD: "/user/reset-password",
  CHANGE_PASSWORD: "/user/change-password",
  OAUTH_GOOGLE: "/user/oauth/google",
  FOLLOWING: (userid: string) => `/user/${userid}/following`,
  FOLLOWERS: (userid: string) => `/user/${userid}/followers`,
  CONVERSATIONS_MESSAGES: (receiver_id: string) =>
    `/user/conversations/${receiver_id}/messages`,
  CONVERSATIONS: "/user/conversations",
  CONVERSATIONS_DELETE: (receiver_id: string) =>
    `/user/conversations/${receiver_id}`,
  INSIGHTS: "/user/insights",
  // User
  ME: "/user/me",
  PROFILE: (username: string) => `/user/${username}`,
  FOLLOW: "/user/follow",
  // Tweets
  TWEETS: "/tweets",
  CREATE_TWEET: "/tweets/create-tweet",
  TWEET: (id: string) => `/tweets/${id}`,
  TWEET_CHILDREN: (id: string) => `/tweets/${id}/children`,
  DELETE_TWEET: (id: string) => `/tweets/delete-tweet/${id}`,
  UNRETWEET: (id: string) => `/tweets/unretweet/${id}`,
  TOTAL_ARCHIVED_TWEET: (id: string) => `/tweets/total-archived-tweet/${id}`,
  // Interactions
  LIKES: "/likes",
  BOOKMARKS: "/bookmarks",
  // Media
  UPLOAD_IMAGE: "/medias/upload-image",
  UPLOAD_VIDEO: "/medias/upload-video",
  UPLOAD_VIDEO_HLS: "/medias/upload-video-hls",
  // Search
  SEARCH: "/search",
  SEARCH_HASTAG: "/search/hastag",

  // bot
  BOTS: "/bots",
  BOT: (id: string) => `/bots/${id}`,
  BOT_SETTINGS: (id: string) => `/bots/settings/${id}`,
  //noti
  GET_NOTIFICATIONS: "/notifications?limit=10&offset=0",
  CREATE_NOTIFICATION: "/notifications/create-notification",
  READ_NOTIFICATION: (id: string) => `/notifications/${id}/read`,
  READ_ALL_NOTIFICATIONS: "/notifications/read-all",
  COUNT_UNREAD_NOTIFICATIONS: "/notifications/unread-count",
  DELETE_NOTIFICATION: (id: string) => `/notifications/${id}/delete`,
} as const;
