import { NextFunction, Request, RequestHandler, Response } from "express";

export const wrapAsync = <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
  func: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => Promise<any>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
