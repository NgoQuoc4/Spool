import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
import { ErrorWithStatus } from "~/models/errors";
import {
  ChangePasswordRequestBody,
  FollowUserRequestBody,
  GetProfileReqParams,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  UpdateMeRequestBody,
} from "~/models/requests/User.requests";
import prisma from "~/services/prisma.service";
import usersService from "~/services/users.service";
import { ok, created } from "~/utils/api.response";

export const loginController = async (
  req: Request<{}, any, LoginRequestBody>,
  res: Response,
) => {
  const data = await usersService.signIn(req.body);
  return ok(res, data, "Login success");
};

export const signUpController = async (
  req: Request<{}, any, RegisterRequestBody>,
  res: Response,
) => {
  const data = await usersService.signUp(req.body);
  return created(res, data, "Sign up success");
};

export const logOutController = async (
  req: Request<{}, any, LogoutRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  const data = await usersService.logOut(req.body);
  return ok(res, data, "Logout success");
};

export const verifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = (req as Request).decoded_verify_email_token as TokenPayload;
  const user = await prisma.user.findUnique({ where: { id: user_id } });
  if (!user) {
    throw new ErrorWithStatus({ message: "User id not found", status: 404 });
  }
  if (user.email_verify_token === "") {
    return ok(res, null, "Email verify token has been used");
  }
  const data = await usersService.verifyEmail(user_id);
  return ok(res, data, "Email verify success");
};

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { id } = req.user as User;
  const data = await usersService.resendVerifyEmail(id);
  return ok(res, data, "Resend verify email success");
};

export const forgotPasswordController = async (
  req: Request<{}, any, { email: string }>,
  res: Response,
) => {
  const user = req?.user as User;
  const { email } = req.body;
  const payload = user ? { id: user.id, email: user.email } : { email };
  await usersService.forgotPassword(payload);
  return ok(res, null, "Forgot password email sent");
};

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return ok(res, { forgot_password_token: req.body.forgot_password_token }, "Verify forgot password token success");
};

export const resetPasswordController = async (
  req: Request<{}, any, ResetPasswordRequestBody>,
  res: Response,
) => {
  const user = req.user as User;
  const data = await usersService.resetPassword(
    user.id,
    req.body.password,
    req.body.confirmPassword,
    req.body.forgot_password_token,
  );
  return ok(res, data, "Reset password success");
};

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const data = await usersService.getMe(user_id);
  return ok(res, data, "Get me success");
};

export const patchMeController = async (
  req: Request<{}, any, UpdateMeRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const data = await usersService.patchMe(user_id, req.body);
  return ok(res, data, "Patch me success");
};

export const getUserByUsernameController = async (
  req: Request<GetProfileReqParams>,
  res: Response,
) => {
  const { username } = req.params;
  const data = await usersService.getUserByUsername(username);
  return ok(res, data, "Get user by username success");
};

export const followUserController = async (
  req: Request<{}, any, FollowUserRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const data = await usersService.followUser(user_id, req.body.followedUserId);
  return ok(res, data, "Follow user success");
};

export const unfollowUserController = async (
  req: Request<{}, any, FollowUserRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const data = await usersService.unfollowUser(user_id, req.body.followedUserId);
  return ok(res, data, "Unfollow user success");
};

export const changePasswordController = async (
  req: Request<{}, any, ChangePasswordRequestBody>,
  res: Response,
) => {
  const user = req.decoded_authorization as TokenPayload;
  const data = await usersService.changePassword(user.user_id, req.body);
  return ok(res, data, "Change password success");
};

export const googleOauthController = async (req: Request, res: Response) => {
  const { code } = req.query as { code: string };
  if (!code) {
    throw new ErrorWithStatus({ message: "Code is required", status: 400 });
  }
  const result = await usersService.googleOauth(code);
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const urlRedirect = `${clientUrl}/login?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&new_user=${result.newUser ? 1 : 0}`;
  return res.redirect(urlRedirect);
};

export const refreshTokenController = async (
  req: Request<{}, any, RefreshTokenRequestBody>,
  res: Response,
) => {
  const { user_id, exp } = req.decoded_authorization as TokenPayload;
  const { refresh_token } = req.body;
  const data = await usersService.refreshToken(user_id, refresh_token, exp);
  return ok(res, data, "Refresh token success");
};

export const getFollowingController = async (req: Request, res: Response) => {
  const { userid } = req.params;
  const data = await usersService.following(userid as string);
  return ok(res, data, "Get following success");
};

export const getMessagesController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { receiver_id } = req.params;
  const { cursor, limit } = req.query;
  const data = await usersService.getMessages(
    user_id as string,
    receiver_id as string,
    limit ? Number(limit) : 50,
    cursor ? (cursor as string) : undefined,
  );
  return ok(res, data, "Get messages success");
};

export const getConversationsController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const data = await usersService.getConversations(user_id);
  return ok(res, data, "Get conversations success");
};

export const deleteConversationController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { receiver_id } = req.params as { receiver_id: string };
  const data = await usersService.deleteConversation(user_id, receiver_id);
  return ok(res, data, "Delete conversation success");
};
