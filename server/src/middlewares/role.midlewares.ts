import { Request, Response, NextFunction } from "express";
import { checkSchema } from "express-validator";
import { UserRole } from "@prisma/client";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/models/errors";
import { TokenPayload } from "~/models/requests/User.requests";
import prisma from "~/services/prisma.service";
import { validate } from "~/utils/validation";

/**
 * Middleware kiểm tra quyền hạn của User đang đăng nhập
 * @param allowedRoles Danh sách các role được phép truy cập (ví dụ: [UserRole.Admin])
 * Lưu ý: Middleware này phải đặt SAU accessTokenValidator để có req.decoded_authorization
 */
export const checkRole = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = (req.decoded_authorization as TokenPayload) || {};

    if (!user_id) {
      return next(
        new ErrorWithStatus({
          message: "Yêu cầu đăng nhập để thực hiện hành động này",
          status: HTTP_STATUS.UNAUTHORIZED,
        }),
      );
    }

    // Lấy role hiện tại của user từ Database
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: { role: true },
    });

    if (!user || !allowedRoles.includes(user.role)) {
      return next(
        new ErrorWithStatus({
          message: "Bạn không có quyền thực hiện hành động này (Forbidden)",
          status: HTTP_STATUS.FORBIDDEN,
        }),
      );
    }

    next();
  };
};

/**
 * Shortcut kiểm tra chỉ dành riêng cho Admin
 */
export const isAdminValidator = checkRole([UserRole.Admin]);

/**
 * Shortcut kiểm tra dành cho Admin hoặc Bot
 */
export const isAdminOrBotValidator = checkRole([UserRole.Admin, UserRole.Bot]);

/**
 * Middleware kiểm tra dữ liệu req.body.role khi có API cập nhật role của User
 */
export const roleBodyValidator = validate(
  checkSchema(
    {
      role: {
        notEmpty: {
          errorMessage: "Role không được để trống",
        },
        isIn: {
          options: [Object.values(UserRole)],
          errorMessage: `Role không hợp lệ. Chỉ chấp nhận: ${Object.values(UserRole).join(", ")}`,
        },
      },
    },
    ["body"],
  ),
);
