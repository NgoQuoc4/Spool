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
  const botId = (req.body?.bot_id || req.query?.bot_id) as string | undefined;
  const result = await botsService.autoPostLatestNews(botId);
  return res.json({
    message: "Tweet created successfully",
    data: result,
  });
};

export const getBotSettingByIdController = async (
  req: Request,
  res: Response,
) => {
  const bot_id = req.params.bot_id as string;
  console.log("bot_id", bot_id);
  const result = await botsService.getBotSettingById(bot_id);
  return res.json({
    message: "Bot",
    data: result,
  });
};

export const updateBotSettingsController = async (
  req: Request,
  res: Response,
) => {
  const user_id = (req.decoded_authorization as TokenPayload | undefined)
    ?.user_id;
  const bot_id = req.params.bot_id as string;
  const payload = req.body as any;
  console.log("payload", payload);
  console.log("bot_id", bot_id);

  const result = await botsService.updateBotSettings(bot_id, payload);
  return res.json({
    message: "Tweet created successfully",
    // data: result,
  });
};
