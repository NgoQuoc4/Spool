import { JwtPayload } from "jsonwebtoken";
import { TokenType } from "~/constants/enums";
import { ParamsDictionary } from "express-serve-static-core";

export interface RegisterRequestBody {
  email: string;
  password: string;
  confirm_password: string;
  name: string;
  date_of_birth: string;
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
  confirm_password: string;
  forgot_password_token: string;
}
export interface ForgotPasswordToken {
  token: string;
  user_id: string;
}

export interface UpdateMeRequestBody {
  name?: string;
  password?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
}

export interface GetProfileReqParams extends ParamsDictionary {
  username: string;
}

export interface FollowUserRequestBody {
  followed_user_id: string;
}
export interface ChangePasswordRequestBody {
  password: string;
  confirm_password: string;
  old_password: string;
}

export interface RefreshTokenRequestBody {
  refresh_token: string;
}
export interface LikeRequestBody {
  tweet_id: string;
}
export interface BookmarkRequestBody {
  tweet_id: string;
}
