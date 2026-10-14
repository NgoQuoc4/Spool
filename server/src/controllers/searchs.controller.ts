import { Request, Response } from "express";
import searchsService from "~/services/searchs.service";

export const searchController = async (req: Request, res: Response) => {
  const { query, tab = "top" } = req.query;
  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  const result = await searchsService.searchQuery({
    query: query as string,
    tab: (tab as "top" | "recent" | "profiles") || "top",
  });
  return res.status(200).json(result);
};
