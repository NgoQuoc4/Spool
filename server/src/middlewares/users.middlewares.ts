import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enums";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { userMessage } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/errors";
import { TokenPayload } from "~/models/requests/User.requests";
import dataservice from "~/services/database.service";
import usersService from "~/services/users.service";
import { comparePassword } from "~/utils/crypto";

import { verifyToken } from "~/utils/jwt";
import { validate } from "~/utils/validation";

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: userMessage.EMAIL_IS_REQUIRED,
        },
        isEmail: {
          errorMessage: userMessage.EMAIL_IS_INVALID,
        },
        trim: true,
        custom: {
          options: async (value) => {
            const emailExists = await usersService.checkEmailExists(value);
            if (!emailExists) {
              throw new Error(userMessage.EMAIL_NOT_FOUND);
            }
            const user = await dataservice.users.findOne({ email: value });
            if (user?.verify === UserVerifyStatus.Unverified) {
              throw new Error(userMessage.EMAIL_NOT_VERIFIED);
            }
            return true;
          },
        },
      },
      password: {
        notEmpty: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED,
        },
        trim: true,
      },
    },
    ["body"],
  ),
);

export const signUpValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: userMessage.EMAIL_IS_REQUIRED,
        },
        isEmail: {
          errorMessage: userMessage.EMAIL_IS_INVALID,
        },
        trim: true,
        custom: {
          options: async (value) => {
            const emailExists = await usersService.checkEmailExists(value);
            if (emailExists) {
              throw new Error(userMessage.EMAIL_ALREADY_EXISTS);
            }
            return true;
          },
        },
      },
      password: {
        notEmpty: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED,
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50,
          },
          errorMessage: userMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          },
          errorMessage: userMessage.PASSWORD_MUST_BE_STRONG,
        },
      },
      confirm_password: {
        notEmpty: {
          errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED,
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50,
          },
          errorMessage:
            userMessage.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          },
          errorMessage: userMessage.CONFIRM_PASSWORD_MUST_BE_STRONG,
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(userMessage.CONFIRM_PASSWORD_NOT_MATCH);
            }
            return true;
          },
        },
      },
      name: {
        notEmpty: {
          errorMessage: userMessage.NAME_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.NAME_MUST_BE_STRING,
        },
        trim: true,
        isLength: {
          options: {
            min: 2,
            max: 100,
          },
          errorMessage: userMessage.NAME_LENGTH_MUST_BE_FROM_2_TO_100,
        },
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true,
          },
          errorMessage: userMessage.DATE_OF_BIRTH_MUST_BE_ISO8601,
        },
      },
    },
    ["body"],
  ),
);

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || "").split(" ")[1];
            if (!access_token) {
              throw new ErrorWithStatus({
                message: userMessage.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
              });
              (req as Request).decoded_authorization = decoded_authorization;
            } catch (error) {
              throw new ErrorWithStatus({
                message: userMessage.ACCESS_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
    },
    ["headers"],
  ),
);

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (refresh_token: string, { req }) => {
            if (!refresh_token) {
              throw new ErrorWithStatus({
                message: userMessage.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            try {
              const [decoded_authorization, refresh_token_in_database] =
                await Promise.all([
                  verifyToken({
                    token: refresh_token,
                    secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
                  }),
                  dataservice.refreshTokens.findOne({ token: refresh_token }),
                ]);

              if (!refresh_token_in_database) {
                throw new ErrorWithStatus({
                  message: userMessage.REFRESH_TOKEN_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED,
                });
              }
              (req as Request).decoded_authorization = decoded_authorization;
            } catch (error) {
              throw new ErrorWithStatus({
                message: userMessage.REFRESH_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (email_verify_token: string, { req }) => {
            if (!email_verify_token) {
              throw new ErrorWithStatus({
                message: userMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            try {
              const decoded_verify_email_token = await verifyToken({
                token: email_verify_token,
                secretKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
              });
              (req as Request).decoded_verify_email_token =
                decoded_verify_email_token;
            } catch (error) {
              throw new ErrorWithStatus({
                message: userMessage.EMAIL_VERIFY_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const resendVerifyEmailValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: {
          errorMessage: userMessage.EMAIL_IS_REQUIRED,
        },
        isEmail: {
          errorMessage: userMessage.EMAIL_IS_INVALID,
        },
        custom: {
          options: async (value: string, { req }) => {
            // Check if email exists
            const user = await dataservice.users.findOne({ email: value });
            if (!user) {
              throw new ErrorWithStatus({
                message: userMessage.EMAIL_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            // Check if user is verified
            if (user?.verify === UserVerifyStatus.Verified) {
              throw new ErrorWithStatus({
                message: userMessage.EMAIL_ALREADY_VERIFIED,
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }
            // Check if user is baned
            if (user?.verify === UserVerifyStatus.Banned) {
              throw new ErrorWithStatus({
                message: userMessage.USER_IS_BANNED,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            // Lưu thông tin user vào req để controller đỡ phải query lại
            (req as Request).user = user;
            console.log("req.user", req.user);
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: {
          errorMessage: userMessage.EMAIL_IS_REQUIRED,
        },
        isEmail: {
          errorMessage: userMessage.EMAIL_IS_INVALID,
        },
        custom: {
          options: async (value: string, { req }) => {
            // Check if email exists
            const user = await dataservice.users.findOne({ email: value });
            if (!user) {
              throw new ErrorWithStatus({
                message: userMessage.EMAIL_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            // Check if user is verified
            if (user?.verify === UserVerifyStatus.Unverified) {
              throw new ErrorWithStatus({
                message: userMessage.EMAIL_NOT_VERIFIED,
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }
            // Check if user is baned
            if (user?.verify === UserVerifyStatus.Banned) {
              throw new ErrorWithStatus({
                message: userMessage.USER_IS_BANNED,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            // Lưu thông tin user vào req để controller đỡ phải query lại
            (req as Request).user = user;
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }

            try {
              // 1. Verify chữ ký và kiểm tra hạn sử dụng của token
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretKey: process.env
                  .JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
              });
              (req as Request).decoded_forgot_password_token =
                decoded_forgot_password_token;
              // 2. Tìm user trong DB theo user_id giải mã được
              const { user_id } = decoded_forgot_password_token;
              const user = await dataservice.users.findOne({
                _id: new ObjectId(user_id),
              });

              if (!user) {
                throw new ErrorWithStatus({
                  message: userMessage.USER_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND,
                });
              }

              // 3. So khớp token gửi lên với token đang lưu trong DB
              if (user.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: userMessage.FORGOT_PASSWORD_TOKEN_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED,
                });
              }

              // 4. Lưu thông tin user vào req để controller đỡ phải query lại
              (req as Request).user = user;
            } catch (error) {
              throw new ErrorWithStatus({
                message: userMessage.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: {
        notEmpty: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED,
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50,
          },
          errorMessage: userMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          },
          errorMessage: userMessage.PASSWORD_MUST_BE_STRONG,
        },
      },
      confirm_password: {
        notEmpty: {
          errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED,
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50,
          },
          errorMessage:
            userMessage.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          },
          errorMessage: userMessage.CONFIRM_PASSWORD_MUST_BE_STRONG,
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(userMessage.CONFIRM_PASSWORD_NOT_MATCH);
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100,
          },
          errorMessage: userMessage.NAME_LENGTH_MUST_BE_FROM_1_TO_100,
        },
      },
      date_of_birth: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true,
          },
          errorMessage: userMessage.DATE_OF_BIRTH_MUST_BE_ISO8601,
        },
      },
      bio: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100,
          },
          errorMessage: userMessage.BIO_LENGTH_MUST_BE_FROM_1_TO_100,
        },
      },
      location: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100,
          },
          errorMessage: userMessage.LOCATION_LENGTH_MUST_BE_FROM_1_TO_100,
        },
      },
      website: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100,
          },
          errorMessage: userMessage.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_100,
        },
      },
      username: {
        optional: true,
        isString: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const regex = /^[A-Za-z0-9_]{1,15}$/;
            if (!regex.test(value)) {
              throw new Error(
                userMessage.USERNAME_MUST_BE_ALPHANUMERIC_AND_UNDERSCORE,
              );
            }
            const user = await dataservice.users.findOne({
              username: value,
            });
            if (user) {
              throw new Error(userMessage.USERNAME_ALREADY_EXISTS);
            }
            return true;
          },
        },
      },
      avatar: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 400,
          },
          errorMessage: userMessage.AVATAR_LENGTH_MUST_BE_FROM_1_TO_100,
        },
      },
      cover_photo: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 400,
          },
          errorMessage: userMessage.COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_100,
        },
      },
    },
    ["body"],
  ),
);

export const followUserValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        notEmpty: {
          errorMessage: userMessage.FOLLOWED_USER_ID_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.FOLLOWED_USER_ID_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessage.FOLLOWED_USER_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }
            const user = await dataservice.users.findOne({
              _id: new ObjectId(value),
            });
            if (!user) {
              throw new ErrorWithStatus({
                message: userMessage.FOLLOWED_USER_ID_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            if (user._id.toString() === (req as Request).user?._id.toString()) {
              throw new ErrorWithStatus({
                message: userMessage.FOLLOWED_USER_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const changePasswordValidator = validate(
  checkSchema(
    {
      password: {
        notEmpty: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED,
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50,
          },
          errorMessage: userMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          },
          errorMessage: userMessage.PASSWORD_MUST_BE_STRONG,
        },
      },
      confirm_password: {
        notEmpty: {
          errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED,
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50,
          },
          errorMessage:
            userMessage.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          },
          errorMessage: userMessage.CONFIRM_PASSWORD_MUST_BE_STRONG,
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(userMessage.CONFIRM_PASSWORD_NOT_MATCH);
            }
            return true;
          },
        },
      },
      old_password: {
        notEmpty: {
          errorMessage: userMessage.OLD_PASSWORD_IS_REQUIRED,
        },
        isString: {
          errorMessage: userMessage.OLD_PASSWORD_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const { user_id } = (req as Request)
              .decoded_authorization as TokenPayload;
            const user = await dataservice.users.findOne({
              _id: new ObjectId(user_id),
            });
            if (!user) {
              throw new ErrorWithStatus({
                message: userMessage.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            const isPasswordValid = comparePassword(value, user.password);
            if (!isPasswordValid) {
              throw new Error(userMessage.INVALID_PASSWORD);
            }
            if (value === req.body.password) {
              throw new Error(
                userMessage.NEW_PASSWORD_MUST_BE_DIFFERENT_FROM_OLD_PASSWORD,
              );
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);
