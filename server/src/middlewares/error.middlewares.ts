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
    return res.status(err.status).json(omit(err, ["status"]));
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true });
  });
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, ["stack"]),
  });
};
