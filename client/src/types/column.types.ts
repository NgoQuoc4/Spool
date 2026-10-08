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
  | "other_feeds";

export interface ColumnItem {
  type: ColumnKey;
  label: string;
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
  other_feeds: "Bảng feed khác",
};
