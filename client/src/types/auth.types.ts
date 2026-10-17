import type { User } from './user.types';
import type { ApiSuccess } from './api.types';

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string; // ISO 8601
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthResponse = ApiSuccess<AuthTokens & { user?: User }>;
export type RefreshTokenResponse = ApiSuccess<AuthTokens>;
