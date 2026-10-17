import http, { tokenStore } from "./http";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
  LoginBody,
  RegisterBody,
  AuthResponse,
  RefreshTokenResponse,
  AuthTokens,
} from "@/types/auth.types";
import type { User } from "@/types/user.types";
import type { ApiSuccess } from "@/types/api.types";

export const authApi = {
  signIn: (body: LoginBody) => http.post<AuthResponse>(ENDPOINTS.SIGN_IN, body),

  signUp: (body: RegisterBody) =>
    http.post<AuthResponse>(ENDPOINTS.SIGN_UP, body),

  logout: () => {
    const refresh_token = tokenStore.getRefresh();
    return http.post(ENDPOINTS.LOGOUT, { refresh_token });
  },

  getMe: () => http.get<ApiSuccess<User>>(ENDPOINTS.ME),

  refreshToken: (refresh_token: string) =>
    http.post<RefreshTokenResponse>(ENDPOINTS.REFRESH_TOKEN, { refresh_token }),

  verifyEmail: (email_verify_token: string) =>
    http.post<ApiSuccess<AuthTokens | null>>(
      ENDPOINTS.VERIFY_EMAIL,
      { email_verify_token },
    ),

  resendVerifyEmail: () => http.post(ENDPOINTS.RESEND_VERIFY_EMAIL),

  forgotPassword: (email: string) =>
    http.post(ENDPOINTS.FORGOT_PASSWORD, { email }),

  verifyForgotPassword: (forgot_password_token: string) =>
    http.post(ENDPOINTS.VERIFY_FORGOT_PASSWORD, { forgot_password_token }),

  resetPassword: (body: {
    forgot_password_token: string;
    password: string;
    confirmPassword: string;
  }) => http.post(ENDPOINTS.RESET_PASSWORD, body),
};
