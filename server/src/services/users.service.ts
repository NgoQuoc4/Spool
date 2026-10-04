import { ObjectId } from "mongodb";
import User from "~/models/schemas/User.schema";
import { Follow } from "~/models/schemas/Follow.schema";
import dataservice from "./database.service";

import {
  ChangePasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  TokenPayload,
  UpdateMeRequestBody,
} from "~/models/requests/User.requests";
import { comparePassword, hashPassword } from "~/utils/crypto";
import { signToken, verifyToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import "dotenv/config";
import { SignOptions } from "jsonwebtoken";
import { RefreshToken } from "~/models/schemas/RefreshToken.schema";
import { userMessage } from "~/constants/messages";
import axios from "axios";
class UsersService {
  constructor() {}

  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
      } as SignOptions,
    });
  }

  private signRefreshToken({
    user_id,
    exp,
  }: {
    user_id: string;
    exp?: number;
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        ...(exp ? { exp } : {}),
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: exp
        ? undefined
        : ({ expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN } as SignOptions),
    });
  }

  private async decodeRefreshToken(token: string) {
    const decoded = await verifyToken({
      token,
      secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
    });
    return decoded;
  }

  private signEmailVerificationToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerificationToken,
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN as string,
      } as SignOptions,
    });
  }

  private signAccessAndRefreshToken(user_id: string, exp?: number) {
    return Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken({ user_id, exp }),
    ]);
  }

  private forgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
      } as SignOptions,
    });
  }

  async signIn(payload: LoginRequestBody) {
    const result = await dataservice.users.findOne({ email: payload.email });
    if (!result) {
      throw new Error(userMessage.EMAIL_NOT_FOUND);
    }

    const isPasswordValid = comparePassword(payload.password, result.password);
    if (!isPasswordValid) {
      throw new Error(userMessage.INVALID_PASSWORD);
    }

    const user_id = result._id.toString();
    const [accessToken, refreshToken] =
      await this.signAccessAndRefreshToken(user_id);
    const { iat, exp } = await this.decodeRefreshToken(refreshToken);
    await dataservice.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(user_id),
        iat: iat,
        exp: exp,
      }),
    );
    return { accessToken, refreshToken };
  }

  async signUp(payload: RegisterRequestBody) {
    const dateOfBirth = new Date(payload.date_of_birth);
    const hashedPassword = hashPassword(payload.password);
    const user_id = new ObjectId();
    const emailVerificationToken = await this.signEmailVerificationToken(
      user_id.toString(),
    );
    const result = await dataservice.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: payload.email.toLowerCase().split("@")[0],
        email_verify_token: emailVerificationToken,
        date_of_birth: dateOfBirth,
        password: hashedPassword,
      }),
    );
    return { emailVerificationToken };
  }

  async logOut(payload: LogoutRequestBody) {
    const result = await dataservice.refreshTokens.deleteOne({
      token: payload.refresh_token,
    });
    if (result.deletedCount === 0) {
      throw new Error("Token not found");
    }
    return true;
  }

  async checkEmailExists(email: string) {
    const user = await dataservice.users.findOne({ email });
    if (user) {
      return true;
    }
    return false;
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      dataservice.users.updateOne(
        {
          _id: new ObjectId(user_id),
        },
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            updated_at: new Date(),
            email_verify_token: "",
          },
        },
      ),
    ]);
    const [accessToken, refreshToken] = token;
    const { iat, exp } = await this.decodeRefreshToken(refreshToken);

    await dataservice.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(user_id),
        iat: iat,
        exp: exp,
      }),
    );
    return { accessToken, refreshToken };
  }

  async resendVerifyEmail(user_id: string) {
    const emailVerificationToken = await this.signEmailVerificationToken(
      user_id.toString(),
    );

    const result = await dataservice.users.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          updated_at: new Date(),
          email_verify_token: emailVerificationToken,
        },
      },
    );
    return true;
  }

  async forgotPassword(user_id: string) {
    const forgotPasswordToken = await this.forgotPasswordToken(user_id);
    const result = await dataservice.users.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          updated_at: new Date(),
          forgot_password_token: forgotPasswordToken,
        },
      },
    );

    //gửi email
    //https://localhost:3000/verify-forgot-password-token?token=${forgotPasswordToken}&user_id=${user_id}
    return { forgotPasswordToken };
  }

  async resetPassword(
    user_id: string,
    password: string,
    confirm_password: string,
    forgot_password_token: string,
  ) {
    if (password !== confirm_password) {
      throw new Error("Password and confirm password do not match");
    }
    const hashedPassword = hashPassword(password);
    const result = await dataservice.users.updateOne(
      {
        _id: new ObjectId(user_id),
        forgot_password_token: forgot_password_token,
      },
      {
        $set: {
          updated_at: new Date(),
          password: hashedPassword,
          forgot_password_token: "",
        },
      },
    );
    return true;
  }

  async getMe(user_id: string) {
    const user = await dataservice.users.findOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        projection: {
          _id: 0,
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async patchMe(user_id: string, payload: UpdateMeRequestBody) {
    const _payload = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload;
    const result = await dataservice.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody as { date_of_birth?: Date }),
          updated_at: new Date(),
        },
      },
      {
        projection: {
          _id: 0,
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
        returnDocument: "after",
      },
    );
    return result;
  }
  async getUserByUsername(username: string) {
    const user = await dataservice.users.findOne(
      {
        username: username,
      },
      {
        projection: {
          _id: 0,
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async followUser(user_id: string, followed_user_id: string) {
    //Check follow myself
    if (user_id === followed_user_id) {
      throw new Error("User cannot follow himself");
    }

    // Check if already following
    const existingFollow = await dataservice.follows.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    if (existingFollow) {
      return { message: "Already followed" };
    }

    await dataservice.follows.insertOne(
      new Follow(
        new ObjectId(user_id),
        new ObjectId(followed_user_id),
        new Date(),
      ),
    );
    return { message: "Follow user success" };
  }

  async unfollowUser(user_id: string, followed_user_id: string) {
    // Check if already following
    const existingFollow = await dataservice.follows.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    if (!existingFollow) {
      return { message: "Not follow" };
    }

    const result = await dataservice.follows.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    if (result.deletedCount === 0) {
      throw new Error("User not found");
    }
    return { message: "Unfollow user success" };
  }

  async changePassword(user_id: string, payload: ChangePasswordRequestBody) {
    const hashedPassword = hashPassword(payload.password);
    await dataservice.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashedPassword, updated_at: new Date() } },
    );
    // Xoá tất cả refresh token → buộc đăng nhập lại trên mọi thiết bị
    await dataservice.refreshTokens.deleteMany({
      user_id: new ObjectId(user_id),
    });
    return { message: "Change password success. Please login again." };
  }

  private async getOAuthGoogleAccessToken(code: string) {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const body = {
      code,
      grant_type: "authorization_code",
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URIS,
    };
    const { data } = await axios.post(tokenUrl, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  }

  private async getGoogleUserProfile(access_token: string) {
    const url = "https://www.googleapis.com/oauth2/v1/userinfo";
    const config = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };
    const data = await axios.get(url, config);
    return data;
  }

  async googleOauth(code: string) {
    const data = await this.getOAuthGoogleAccessToken(code);
    const accessToken = data.access_token;
    const { data: profile } = await this.getGoogleUserProfile(accessToken);

    // Check user exist
    const user = await dataservice.users.findOne({
      email: profile.email,
    });

    if (user === null) {
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const user_id = new ObjectId();
      const result = await dataservice.users.insertOne(
        new User({
          _id: user_id,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          email_verify_token: "",
          password: hashPassword(randomPassword),
          verify: UserVerifyStatus.Verified,
          date_of_birth: new Date(),
        }),
      );
      const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
        user_id.toString(),
      );
      const { iat, exp } = await this.decodeRefreshToken(refreshToken);
      await dataservice.refreshTokens.insertOne(
        new RefreshToken({
          token: refreshToken,
          user_id: new ObjectId(user_id),
          iat: iat,
          exp: exp,
        }),
      );
      return { accessToken, refreshToken, newUser: !user };
    } else {
      if (user.verify === UserVerifyStatus.Unverified) {
        throw new Error("User is not verified");
      }
      const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
        user._id.toString(),
      );
      const { iat, exp } = await this.decodeRefreshToken(refreshToken);
      await dataservice.refreshTokens.insertOne(
        new RefreshToken({
          token: refreshToken,
          user_id: new ObjectId(user._id),
          iat: iat,
          exp: exp,
        }),
      );
      return { accessToken, refreshToken, newUser: !user };
    }
  }

  async refreshToken(user_id: string, refresh_token: string, exp: number) {
    // Xóa refresh token cũ (chính token client vừa gửi lên)
    await dataservice.refreshTokens.deleteOne({ token: refresh_token });

    const { iat } = await this.decodeRefreshToken(refresh_token);
    const [newAccessToken, newRefreshToken] =
      // Tạo cặp token mới (giữ nguyên hạn exp của refresh token cũ)
      await this.signAccessAndRefreshToken(user_id, exp);
    // Lưu refresh token mới vào DB
    await dataservice.refreshTokens.insertOne(
      new RefreshToken({
        token: newRefreshToken,
        user_id: new ObjectId(user_id),
        iat: iat,
        exp: exp,
      }),
    );
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

const usersService = new UsersService();
export default usersService;
