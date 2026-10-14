export type SearchTabType = "top" | "recent" | "profiles";

export interface SearchRequestBody {
  query: string;
  tab?: SearchTabType;
}
