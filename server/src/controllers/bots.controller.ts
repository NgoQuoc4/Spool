import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "~/models/requests/User.requests";
import botsService from "~/services/bots.service";

export const botsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await botsService.getBots();
  return res.json({
    message: "Bots",
    result,
  });
};

export const autoPostBotController = async (req: Request, res: Response) => {
  const user_id = (req.decoded_authorization as TokenPayload | undefined)
    ?.user_id;
  const result = await botsService.autoPostLatestNews(user_id);
  return res.json({
    message: "Tweet created successfully",
    data: result,
  });
};
