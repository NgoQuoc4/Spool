import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";
import type { SearchRequestBody } from "@/types/search.types";

export const searchApi = {
  searchUsers: (params: SearchRequestBody) =>
    http.get(ENDPOINTS.SEARCH, { params }),
};
