export interface SearchRequestBody {
  query: string;
}

export interface SearchRequestQuery {
  query: string;
  tab?: "top" | "recent" | "profiles";
  limit?: string;
}
