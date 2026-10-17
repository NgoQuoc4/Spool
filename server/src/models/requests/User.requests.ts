import { JwtPayload } from "jsonwebtoken";
import { TokenType } from "~/constants/enums";
import { ParamsDictionary } from "express-serve-static-core";

export interface RegisterRequestBody {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  dateOfBirth: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LogoutRequestBody {
  refresh_token: string;
}
export interface TokenPayload extends JwtPayload {
  user_id: string;
  token_type: TokenType;
  iat: number;
  exp: number;
}

export interface ResetPasswordRequestBody {
  password: string;
  confirmPassword: string;
  forgot_password_token: string;
}
export interface ForgotPasswordToken {
  token: string;
  user_id: string;
}

export interface UpdateMeRequestBody {
  name?: string;
  password?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  coverPhoto?: string;
}

export interface GetProfileReqParams extends ParamsDictionary {
  username: string;
}

export interface FollowUserRequestBody {
  followedUserId: string;
}
export interface ChangePasswordRequestBody {
  password: string;
  confirmPassword: string;
  oldPassword: string;
}

export interface RefreshTokenRequestBody {
  refresh_token: string;
}
export interface LikeRequestBody {
  tweetId: string;
}
export interface BookmarkRequestBody {
  tweetId: string;
}
