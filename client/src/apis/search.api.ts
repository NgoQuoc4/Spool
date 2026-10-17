import http from "./http";
import { ENDPOINTS } from "@/constants/endpoints";
import type { SearchRequestBody, SearchResponseData } from "@/types/search.types";
import type { ApiSuccess } from "@/types/api.types";

export const searchApi = {
  searchUsers: (params: SearchRequestBody) =>
    http.get<ApiSuccess<SearchResponseData>>(ENDPOINTS.SEARCH, { params }),
};

