import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "~/models/requests/User.requests";
import botsService from "~/services/bots.service";
import { ok, created } from "~/utils/api.response";

export const botsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await botsService.getBots();
  return ok(res, result, "Get bots success");
};

export const autoPostBotController = async (req: Request, res: Response) => {
  const botId = (req.body?.bot_id || req.query?.bot_id) as string | undefined;
  const result = await botsService.autoPostLatestNews(botId);
  return created(res, result, "Tweet created successfully");
};

export const getBotSettingByIdController = async (
  req: Request,
  res: Response,
) => {
  const bot_id = req.params.bot_id as string;
  const result = await botsService.getBotSettingById(bot_id);
  return ok(res, result, "Get bot setting success");
};

export const updateBotSettingsController = async (
  req: Request,
  res: Response,
) => {
  const bot_id = req.params.bot_id as string;
  const payload = req.body as any;

  const result = await botsService.updateBotSettings(bot_id, payload);
  return ok(res, result, "Update bot settings success");
};
