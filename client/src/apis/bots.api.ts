import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";

import type { ApiSuccess } from "@/types/api.types";

export interface BotItem {
  id: string;
  email: string;
  name: string;
  avatar: string;
  username: string;
}

export const botsApi = {
  getBots: () =>
    http.get<
      ApiSuccess<{
        bots: BotItem[];
        totalItems: number;
      }>
    >(ENDPOINTS.BOTS),

  updateSettingBot: (
    id: string,
    body: {
      rssUrl?: string;
      intervalMinutes?: number;
      postLimit?: number;
      isActive?: boolean;
      website?: string;
    },
  ) =>
    http.patch<ApiSuccess<any>>(
      ENDPOINTS.BOT_SETTINGS(id),
      body,
    ),
};
