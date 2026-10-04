import type { User } from './user.types';

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string; // ISO 8601
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  result: AuthTokens & { user?: User };
}

export interface RefreshTokenResponse {
  message: string;
  result: AuthTokens;
}
