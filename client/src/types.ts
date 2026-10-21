import type { User } from "@/types/user.types";

// Lightweight view-model dùng trong tweet cards, sidebar, follow modal…
// Pick những field chung với User để không lặp lại định nghĩa.
export type Author = Pick<
  User,
  "name" | "username" | "avatar" | "isFollowing"
> & {
  id?: string; // = User._id (API trả về _id, ta normalize ở helper)
  verified?: boolean;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  followers?: string; // legacy display string (e.g. "1.2K")
};

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface ThreadReply {
  id: string;
  author: Author;
  topic?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  media?: {
    type: "image" | "video" | "hls" | "carousel";
    urls: string[];
    aspectRatio?: string;
  };
}

export interface MediaItem {
  urls: string[];
  type: "image" | "video" | "hls" | "file";
  name?: string;
  size?: string;
  aspectRatio?: string;
}

export interface ThreadPost {
  id: string;
  author: Author;
  topic?: string;
  content: string;
  createdAt: string;
  media?: {
    type: "image" | "video" | "hls" | "carousel" | "file";
    urls: string[];
    aspectRatio?: string;
  };
  medias?: MediaItem[];
  poll?: {
    options: PollOption[];
    totalVotes: number;
    userVotedIndex?: number;
  };
  likes: number;
  repliesCount: number;
  repostsCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  isQuote?: boolean;
  quotesCount?: number;
  replies?: ThreadReply[];
  tags?: string[];
  replyAvatars?: string[];
  quotedPost?: ThreadPost;
  isGhost?: boolean;
  expiresAt?: string;
  isArchived?: boolean;

  //Thông tin khi repost
  repostedBy?: Author;
}
export interface LayoutContextType {
  showToast: (msg: string) => void;
  setIsModalOpen: (open: boolean) => void;
}
