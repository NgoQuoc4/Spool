import { Router } from "express";
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followUserValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  resendVerifyEmailValidator,
  resetPasswordValidator,
  signUpValidator,
  updateMeValidator,
  verifyForgotPasswordTokenValidator,
} from "~/middlewares/users.middlewares";
import {
  changePasswordController,
  followUserController,
  forgotPasswordController,
  getMeController,
  getUserByUsernameController,
  googleOauthController,
  loginController,
  logOutController,
  patchMeController,
  refreshTokenController,
  resendVerifyEmailController,
  resetPasswordController,
  signUpController,
  unfollowUserController,
  verifyEmailController,
  verifyForgotPasswordTokenController,
} from "~/controllers/users.controller";
import { wrapAsync } from "~/utils/handles";
import { filterMiddleware } from "~/middlewares/common.midlewares";
import {
  ChangePasswordRequestBody,
  FollowUserRequestBody,
  GetProfileReqParams,
  RefreshTokenRequestBody,
  UpdateMeRequestBody,
} from "~/models/requests/User.requests";

const userRouter = Router();

userRouter.post("/sign-in", loginValidator, wrapAsync(loginController));
/*
 * Description, login a user
 * Path: /user/sign-in
 * Method: POST
 * Body: {email: string, password: string}
 * Response: {message: string, result: {user: User}}
 */

userRouter.post("/sign-up", signUpValidator, wrapAsync(signUpController));
/*
 * Description, resgister a new user
 * Path: /user/sign-up
 * Method: POST
 * Body: {email: string, password: string, confirm_password: string,  name: string, date_of_birth: ISO 8601}
 * Response: {message: string, result: {user: User}}
 */

userRouter.post(
  "/log-out",
  accessTokenValidator,
  refreshTokenValidator,
  wrapAsync(logOutController),
);
/*
 * Description, log out a user
 * Path: /user/log-out
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string}
 * Response: {message: string}
 */

userRouter.post(
  "/verify-email",
  emailVerifyTokenValidator,
  wrapAsync(verifyEmailController),
);

/*
 * Description, verify email
 * Path: /user/verify-email
 * Method: POST
 * Body: {email_verify_token: string}
 * Response: {message: string}
 */

userRouter.post(
  "/resend-verify-email",
  resendVerifyEmailValidator,
  wrapAsync(resendVerifyEmailController),
);
/*
 * Description, refresh access token
 * Path: /user/refresh-access-token
 * Method: POST
 * Header: {Authorization: Bearer <refresh_token>}
 * Response: {message: string}
 */

userRouter.post(
  "/forgot-password",
  forgotPasswordValidator,
  wrapAsync(forgotPasswordController),
);
/*
 * Description, forgot password
 * Path: /user/forgot-password
 * Method: POST
 * Body: {email: string}
 * Response: {message: string}
 */

userRouter.post(
  "/verify-forgot-password-token",
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController),
);
/*
 * Description, verify forgot password token
 * Path: /user/verify-forgot-password-token
 * Method: POST
 * Body: {email: string, forgot_password_token: string}
 * Response: {message: string}
 */

userRouter.post(
  "/reset-password",
  verifyForgotPasswordTokenValidator,
  resetPasswordValidator,
  wrapAsync(resetPasswordController),
);
/*
 * Description, reset password
 * Path: /user/reset-password
 * Method: POST
 * Body: {email: string, forgot_password_token: string}
 * Response: {message: string}
 */

userRouter.get("/me", accessTokenValidator, wrapAsync(getMeController));

userRouter.patch(
  "/me",
  accessTokenValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeRequestBody>([
    "name",
    "date_of_birth",
    "avatar",
    "cover_photo",
    "bio",
    "location",
    "website",
    "username",
    "password",
  ]),
  wrapAsync(patchMeController),
);
/*
 * Description, patch user me
 * Path: /user/me
 * Method: PATCH
 * Body: {email: string, forgot_password_token: string}
 * Response: {message: string}
 */

userRouter.get(
  "/:username",
  filterMiddleware<GetProfileReqParams>(["username"]),
  wrapAsync(getUserByUsernameController),
);
/*
 * Description, get user by username
 * Path: /user/:username
 * Method: GET
 * Body: {username: string}
 * Response: {message: string, result: {user: User}}
 */

userRouter.post(
  "/follow",
  accessTokenValidator,
  followUserValidator,
  filterMiddleware<FollowUserRequestBody>(["followed_user_id"]),
  wrapAsync(followUserController),
);
/*
 * Description, follow a user
 * Path: /user/follow
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {user_id: string}
 * Response: {message: string}
 */

userRouter.delete(
  "/follow",
  accessTokenValidator,
  followUserValidator,
  filterMiddleware<FollowUserRequestBody>(["followed_user_id"]),
  wrapAsync(unfollowUserController),
);
/*
 * Description, follow a user
 * Path: /user/follow
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {user_id: string}
 * Response: {message: string}
 */

userRouter.put(
  "/change-password",
  accessTokenValidator,
  changePasswordValidator,
  filterMiddleware<ChangePasswordRequestBody>([
    "password",
    "confirm_password",
    "old_password",
  ]),
  wrapAsync(changePasswordController),
);
/*
 * Description, change password
 * Path: /user/change-password
 * Method: PUT
 * Header: {Authorization: Bearer <access_token>}
 * Body: {password: string, confirm_password: string, old_password: string}
 * Response: {message: string}
 */

userRouter.get("/oauth/google", wrapAsync(googleOauthController));
/*
 * Description, google oauth
 * Path: /user/oauth/google
 * Method: GET
 * Query: {code: string}
 * Response: {message: string}
 */

userRouter.post(
  "/refresh-token",
  filterMiddleware<RefreshTokenRequestBody>(["refresh_token"]),
  refreshTokenValidator,
  wrapAsync(refreshTokenController),
);

export default userRouter;
