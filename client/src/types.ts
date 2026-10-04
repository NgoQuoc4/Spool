export interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  bio?: string;
  followers?: string;
  isFollowing?: boolean;
}

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
  replies?: ThreadReply[];
  tags?: string[];
  replyAvatars?: string[];
}
export interface LayoutContextType {
  showToast: (msg: string) => void;
  setIsModalOpen: (open: boolean) => void;
}
