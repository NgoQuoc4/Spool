import { NextFunction, Request, Response } from "express";
import { omit } from "lodash";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/models/errors";

export const defaultErrorHanlde = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("❌ Error caught by defaultErrorHanlde:", err);
  if (err instanceof ErrorWithStatus) {
    const body = omit(err, ["status"]) as any;
    return res.status(err.status).json({ success: false, ...body });
  }
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message ?? "Internal server error",
  });
};

