export type ColumnKey =
  | "search"
  | "activity"
  | "profile"
  | "home"
  | "feed"
  | "insights"
  | "save"
  | "follow"
  | "ghost"
  | "like"
  | "message"
  | "archive"
  | "setting"
  | "other_feeds"
  | "bots";

export interface ColumnItem {
  id?: string;
  type: ColumnKey;
  label: string;
  username?: string;
}

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  home: "Trang chủ",
  feed: "Feed",
  search: "Tìm kiếm",
  activity: "Hoạt động",
  profile: "Trang cá nhân",
  insights: "Thông tin chi tiết",
  follow: "Đang theo dõi",
  like: "Đã thích",
  save: "Đã lưu",
  archive: "Kho lưu trữ",
  message: "Tin nhắn",
  ghost: "Ghost",
  setting: "Setting",
  other_feeds: "Bảng feed khác",
  bots: "Bots",
};
