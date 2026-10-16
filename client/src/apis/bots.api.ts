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
};
