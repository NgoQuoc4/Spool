import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";

export interface BotItem {
  id: string;
  email: string;
  name: string;
  avatar: string;
  username: string;
}

export const botsApi = {
  getBots: () =>
    http.get<{
      message: string;
      result: {
        bots: BotItem[];
        totalItems: number;
      };
    }>(ENDPOINTS.BOTS),

  updateSettingBot: (
    id: string,
    body: {
      rss_url?: string;
      interval_minutes?: number;
      post_limit?: number;
      website?: string;
    },
  ) =>
    http.patch<{ message: string; result: any }>(
      ENDPOINTS.BOT_SETTINGS(id),
      body,
    ),
};
