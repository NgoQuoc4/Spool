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
  // User
  ME: "/user/me",
  PROFILE: (username: string) => `/user/${username}`,
  FOLLOW: "/user/follow",
  // Tweets
  TWEETS: "/tweets",
  CREATE_TWEET: "/tweets/create-tweet",
  TWEET: (id: string) => `/tweets/${id}`,
  DELETE_TWEET: (id: string) => `/tweets/delete-tweet/${id}`,
  // Interactions
  LIKES: "/likes",
  BOOKMARKS: "/bookmarks",
  // Media
  UPLOAD_IMAGE: "/medias/upload-image",
  UPLOAD_VIDEO: "/medias/upload-video",
} as const;
