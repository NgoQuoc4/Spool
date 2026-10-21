import { Request, Response } from "express";
import searchsService from "~/services/searchs.service";
import { ok } from "~/utils/api.response";

export const searchController = async (req: Request, res: Response) => {
  const { query, tab = "top" } = req.query;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Query is required" });
  }
  const userId = req.decoded_authorization?.user_id;
  const data = await searchsService.searchQuery({
    query: query.trim(),
    tab: (tab as "top" | "recent" | "profiles") || "top",
    userId,
  });
  return ok(res, data, "Search results fetched successfully");
};

export const hastagController = async (req: Request, res: Response) => {
  const data = await searchsService.hastag();
  return ok(res, data, "Hashtags fetched successfully");
};
