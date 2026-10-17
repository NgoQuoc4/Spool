import type { Tweet } from "./tweet.types";
import type { User } from "./user.types";

export type SearchTabType = "top" | "recent" | "profiles";

export interface SearchRequestBody {
  query: string;
  tab?: SearchTabType;
}

export interface SearchResponseData {
  users: User[];
  tweets: Tweet[];
}

