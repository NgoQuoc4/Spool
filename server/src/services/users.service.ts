import { UserVerifyStatus } from "@prisma/client";
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
import { TokenType } from "~/constants/enums";
import "dotenv/config";
import { SignOptions } from "jsonwebtoken";
import { userMessage } from "~/constants/messages";
import axios from "axios";
import {
  sendForgotPasswordEmail,
  sendVerifyRegisterEmail,
} from "~/utils/email";
import prisma from "./prisma.service";

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
    return verifyToken({
      token,
      secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
    });
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
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) throw new Error(userMessage.EMAIL_NOT_FOUND);

    const isPasswordValid = comparePassword(payload.password, user.password);
    if (!isPasswordValid) throw new Error(userMessage.INVALID_PASSWORD);

    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      user.id,
    );
    const { iat, exp } = await this.decodeRefreshToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        iat: new Date(iat * 1000),
        exp: new Date(exp * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  async signUp(payload: RegisterRequestBody) {
    const hashedPassword = hashPassword(payload.password);
    const emailVerificationToken =
      await this.signEmailVerificationToken("placeholder");

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        username: payload.email.toLowerCase().split("@")[0],
        date_of_birth: new Date(payload.date_of_birth),
        email_verify_token: emailVerificationToken,
      },
    });

    // Re-sign with actual user.id
    const realToken = await this.signEmailVerificationToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { email_verify_token: realToken },
    });

    sendVerifyRegisterEmail(payload.email, realToken).catch(console.error);
    return { emailVerificationToken: realToken };
  }

  async logOut(payload: LogoutRequestBody) {
    const deleted = await prisma.refreshToken.deleteMany({
      where: { token: payload.refresh_token },
    });
    if (deleted.count === 0) throw new Error("Token not found");
    return true;
  }

  async checkEmailExists(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  async verifyEmail(user_id: string) {
    const [[accessToken, refreshToken]] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      prisma.user.update({
        where: { id: user_id },
        data: {
          verify: UserVerifyStatus.Verified,
          email_verify_token: "",
        },
      }),
    ]);

    const { iat, exp } = await this.decodeRefreshToken(refreshToken);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id,
        iat: new Date(iat * 1000),
        exp: new Date(exp * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  async resendVerifyEmail(user_id: string) {
    const emailVerificationToken =
      await this.signEmailVerificationToken(user_id);
    const user = await prisma.user.update({
      where: { id: user_id },
      data: { email_verify_token: emailVerificationToken },
    });
    if (user?.email) {
      sendVerifyRegisterEmail(user.email, emailVerificationToken).catch(
        console.error,
      );
    }
    return true;
  }

  async forgotPassword(data: { id?: string; email: string }) {
    const { id, email } = data;
    if (id) {
      const forgotPasswordToken = await this.forgotPasswordToken(id);
      await prisma.user.update({
        where: { id },
        data: { forgot_password_token: forgotPasswordToken },
      });
      sendForgotPasswordEmail(email, forgotPasswordToken).catch(console.error);
      return { forgotPasswordToken };
    } else {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found");
      const forgotPasswordToken = await this.forgotPasswordToken(user.id);
      await prisma.user.update({
        where: { id: user.id },
        data: { forgot_password_token: forgotPasswordToken },
      });
      sendForgotPasswordEmail(email, forgotPasswordToken).catch(console.error);
      return { forgotPasswordToken };
    }
  }

  async resetPassword(
    user_id: string,
    password: string,
    confirm_password: string,
    forgot_password_token: string,
  ) {
    if (password !== confirm_password)
      throw new Error("Password and confirm password do not match");

    const user = await prisma.user.findFirst({
      where: { id: user_id, forgot_password_token },
    });
    if (!user) throw new Error("Invalid token");

    await prisma.user.update({
      where: { id: user_id },
      data: {
        password: hashPassword(password),
        forgot_password_token: "",
      },
    });
    return true;
  }

  async getMe(user_id: string) {
    const [user, followersCount, followingCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user_id },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          cover_photo: true,
          bio: true,
          location: true,
          website: true,
          date_of_birth: true,
          verify: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.follow.count({ where: { followed_user_id: user_id } }),
      prisma.follow.count({ where: { user_id } }),
    ]);

    if (!user) throw new Error("User not found");
    return {
      ...user,
      _id: user.id,
      followers_count: followersCount,
      following_count: followingCount,
    };
  }

  async patchMe(user_id: string, payload: UpdateMeRequestBody) {
    const data: any = { ...payload };
    if (payload.date_of_birth)
      data.date_of_birth = new Date(payload.date_of_birth);

    const user = await prisma.user.update({
      where: { id: user_id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        cover_photo: true,
        bio: true,
        location: true,
        website: true,
        date_of_birth: true,
        verify: true,
        created_at: true,
        updated_at: true,
      },
    });
    return user;
  }

  async getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        cover_photo: true,
        bio: true,
        location: true,
        website: true,
        date_of_birth: true,
        verify: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!user) throw new Error("User not found");
    return { ...user, _id: user.id };
  }

  async followUser(user_id: string, followed_user_id: string) {
    if (user_id === followed_user_id)
      throw new Error("User cannot follow himself");

    await prisma.follow.upsert({
      where: { user_id_followed_user_id: { user_id, followed_user_id } },
      update: {},
      create: { user_id, followed_user_id },
    });
    return { message: "Follow user success" };
  }

  async unfollowUser(user_id: string, followed_user_id: string) {
    const deleted = await prisma.follow.deleteMany({
      where: { user_id, followed_user_id },
    });
    if (deleted.count === 0) return { message: "Not follow" };
    return { message: "Unfollow user success" };
  }

  async changePassword(user_id: string, payload: ChangePasswordRequestBody) {
    await prisma.user.update({
      where: { id: user_id },
      data: { password: hashPassword(payload.password) },
    });
    // Xoá tất cả refresh token → buộc đăng nhập lại trên mọi thiết bị
    await prisma.refreshToken.deleteMany({ where: { user_id } });
    return { message: "Change password success. Please login again." };
  }

  private async getOAuthGoogleAccessToken(code: string) {
    const body = {
      code,
      grant_type: "authorization_code",
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URIS,
    };
    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      body,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );
    return data;
  }

  private async getGoogleUserProfile(access_token: string) {
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );
    return data;
  }

  async googleOauth(code: string) {
    const data = await this.getOAuthGoogleAccessToken(code);
    const profile = await this.getGoogleUserProfile(data.access_token);

    let user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          password: hashPassword(Math.random().toString(36).substring(2, 15)),
          verify: UserVerifyStatus.Verified,
          username: profile.email.toLowerCase().split("@")[0],
        },
      });
    } else if (user.verify === UserVerifyStatus.Unverified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { verify: UserVerifyStatus.Verified },
      });
    }

    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      user.id,
    );
    const { iat, exp } = await this.decodeRefreshToken(refreshToken);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        iat: new Date(iat * 1000),
        exp: new Date(exp * 1000),
      },
    });
    return { accessToken, refreshToken, newUser: !user };
  }

  async refreshToken(user_id: string, refresh_token: string, exp: number) {
    await prisma.refreshToken.deleteMany({ where: { token: refresh_token } });

    const { iat } = await this.decodeRefreshToken(refresh_token);
    const [newAccessToken, newRefreshToken] =
      await this.signAccessAndRefreshToken(user_id, exp);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        user_id,
        iat: new Date(iat * 1000),
        exp: new Date(exp * 1000),
      },
    });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async following(userid: string) {
    const result = await prisma.follow.findMany({
      where: { user_id: userid },
      select: {
        followed_user_id: true,
        followed_user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    const formattedResult = result.map((item) => ({
      followed_user_id: item.followed_user_id,
      id: item.followed_user.id,
      name: item.followed_user.name,
      username: item.followed_user.username,
      avatar: item.followed_user.avatar,
    }));

    return formattedResult;
  }

  async getMessages(
    sender_id: string,
    receiver_id: string,
    limit = 50,
    cursor?: string,
  ) {
    const messages = await prisma.message.findMany({
      take: -limit,
      ...(cursor && {
        skip: 1, // Bỏ qua chính cái tin nhắn cursor
        cursor: {
          id: cursor,
        },
      }),
      where: {
        OR: [
          { sender_id: sender_id, receiver_id: receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
      orderBy: {
        created_at: "asc", // Tin nhắn cũ ở trên, mới ở dưới
      },
    });
    return messages;
  }

  // Lấy danh sách các cuộc hội thoại (những người đã từng nhắn tin)
  // Query từ bảng Message, trả về thông tin user kèm tin nhắn gần nhất
  async getConversations(user_id: string) {
    // Lấy tất cả tin nhắn liên quan đến user, nhóm theo cặp (sender, receiver)
    // rồi lấy tin nhắn mới nhất của mỗi cặp
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender_id: user_id }, { receiver_id: user_id }],
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        sender_id: true,
        receiver_id: true,
        content: true,
        created_at: true,
        sender: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });

    // Deduplicate: mỗi cặp người dùng chỉ giữ tin nhắn mới nhất
    const seen = new Set<string>();
    const conversations: typeof messages = [];

    for (const msg of messages) {
      // Tạo key không phụ thuộc thứ tự (A-B == B-A)
      const pair = [msg.sender_id, msg.receiver_id].sort().join("-");
      if (seen.has(pair)) continue;
      seen.add(pair);
      conversations.push(msg);
    }

    // Map thành dạng frontend cần: contact user + last message
    return conversations.map((msg) => {
      const isISender = msg.sender_id === user_id;
      const contact = isISender ? msg.receiver : msg.sender;
      return {
        user_id: contact.id,
        name: contact.name,
        username: contact.username,
        avatar: contact.avatar,
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
      };
    });
  }

  async deleteConversation(user_id: string, receiver_id: string) {
    const deleted = await prisma.message.deleteMany({
      where: {
        OR: [
          { sender_id: user_id, receiver_id: receiver_id },
          { sender_id: receiver_id, receiver_id: user_id },
        ],
      },
    });
    if (deleted.count === 0) return { message: "Not have conversation" };
    return { message: "Delete conversation success" };
  }
}

const usersService = new UsersService();
export default usersService;
