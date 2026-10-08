import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
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
import User from "~/models/schemas/User.schema";
import dataservice from "~/services/database.service";
import usersService from "~/services/users.service";

export const loginController = async (
  req: Request<{}, any, LoginRequestBody>,
  res: Response,
) => {
  const result = await usersService.signIn(req.body);
  return res.status(200).json({ message: "Login success", result });
};

export const signUpController = async (
  req: Request<{}, any, RegisterRequestBody>,
  res: Response,
) => {
  const result = await usersService.signUp(req.body);
  return res.status(201).json({
    message: "Sign up success",
    result,
  });
};

export const logOutController = async (
  req: Request<{}, any, LogoutRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  const result = await usersService.logOut(req.body);
  return res.status(200).json({ message: "Logout success", result });
};

export const verifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = (req as Request)
    .decoded_verify_email_token as TokenPayload;
  const user = await dataservice.users.findOne({
    _id: new ObjectId(user_id),
  });
  if (!user) {
    throw new ErrorWithStatus({ message: "User id not found", status: 404 });
  }
  if (user.email_verify_token === "") {
    return res
      .status(200)
      .json({ message: "Email verify token has been used" });
  }

  const result = await usersService.verifyEmail(user_id);
  return res.status(200).json({ message: "Email verify success", result });
};

export const resendVerifyEmailController = async (
  req: Request,
  res: Response,
) => {
  const { _id } = req.user as User;
  const result = await usersService.resendVerifyEmail(_id.toString());
  return res
    .status(200)
    .json({ message: "Resend verify email success", result });
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const user = req.user as User;
  const result = await usersService.forgotPassword(user._id.toString());
  return res.status(200).json({ message: "Forget password success", result });
};

export const verifyForgotPasswordTokenController = async (
  req: Request,
  res: Response,
) => {
  return res.status(200).json({
    message: "Verify forgot password token success",
    result: {
      forgot_password_token: req.body.forgot_password_token,
    },
  });
};

export const resetPasswordController = async (
  req: Request<{}, any, ResetPasswordRequestBody>,
  res: Response,
) => {
  const user = req.user as User;
  const result = await usersService.resetPassword(
    user._id.toString(),
    req.body.password,
    req.body.confirm_password,
    req.body.forgot_password_token,
  );
  return res.status(200).json({ message: "Reset password success", result });
};

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await usersService.getMe(user_id);
  return res.status(200).json({ message: "Get me success", result });
};

export const patchMeController = async (
  req: Request<{}, any, UpdateMeRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await usersService.patchMe(user_id, req.body);
  return res.status(200).json({ message: "Patch me success", result });
};

export const getUserByUsernameController = async (
  req: Request<GetProfileReqParams>,
  res: Response,
) => {
  const { username } = req.params;
  const result = await usersService.getUserByUsername(username);
  return res.status(200).json({
    message: "Get user by username success",
    result,
  });
};

export const followUserController = async (
  req: Request<{}, any, FollowUserRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await usersService.followUser(
    user_id,
    req.body.followed_user_id,
  );
  return res.status(200).json({
    message: "Follow user success",
    result,
  });
};

export const unfollowUserController = async (
  req: Request<{}, any, FollowUserRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await usersService.unfollowUser(
    user_id,
    req.body.followed_user_id,
  );
  return res.status(200).json({
    message: "Unfollow user success",
    result,
  });
};

export const changePasswordController = async (
  req: Request<{}, any, ChangePasswordRequestBody>,
  res: Response,
) => {
  const user = req.decoded_authorization as TokenPayload;
  const result = await usersService.changePassword(user.user_id, req.body);
  return res.status(200).json({ message: "Change password success", result });
};

export const googleOauthController = async (req: Request, res: Response) => {
  const { code } = req.query as { code: string };
  if (!code) {
    throw new ErrorWithStatus({ message: "Code is required", status: 400 });
  }
  const result = await usersService.googleOauth(code);

  const urlRedirect = `http://localhost:3000/login?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&new_user=${result.newUser ? 1 : 0}`;

  return res.redirect(urlRedirect);
};

export const refreshTokenController = async (
  req: Request<{}, any, RefreshTokenRequestBody>,
  res: Response,
) => {
  const { user_id, exp } = req.decoded_authorization as TokenPayload;
  const { refresh_token } = req.body;
  const result = await usersService.refreshToken(user_id, refresh_token, exp);
  return res.status(200).json({ message: "Refresh token success", result });
};
