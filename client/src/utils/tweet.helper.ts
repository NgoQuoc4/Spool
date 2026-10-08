import type { TweetsResponse } from "@/apis/tweets.api";
import { useFormatRelativeTime } from "@/hooks/useFormatRelativeTime";
import type { ThreadPost } from "@/types";
import type { Tweet } from "@/types/tweet.types";
import type { InfiniteData } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

export const formatTweetToThreadPost = (tweet: Tweet): ThreadPost => {
  // chuyển hashtags sang dạng string
  const hashtags: string[] = Array.isArray(tweet.hashtags)
    ? tweet.hashtags.map((hashtag: any) =>
        typeof hashtag === "string" ? hashtag : hashtag?.name || "",
      )
    : [];
  // chuyển medias sang dạng  {
  //     type: "image",
  //     urls: ["url"],
  //   },
  const medias = tweet.medias?.map((media) => ({
    type: media.type as any,
    urls: [media.url],
  }));
  // lấy media đầu tiên để hiển thị ở tweet card
  const media =
    tweet.medias && tweet.medias.length > 0
      ? {
          type: tweet.medias[0].type as any,
          urls: tweet.medias.map((m) => m.url),
        }
      : undefined;

  return {
    id: tweet._id,
    author: {
      id: tweet.user?._id || tweet.user_id,
      name: tweet.user?.name || "Anonymous",
      username: tweet.user?.username?.trim() || "unknown",
      avatar:
        tweet.user?.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      verified: true,
    },
    content: tweet.content,
    createdAt: tweet.created_at
      ? useFormatRelativeTime(tweet.created_at)
      : "Just now",
    likes: (tweet as any).likes_count ?? tweet.like ?? 0,
    repliesCount: 0,
    repostsCount: 0,
    isLiked: Boolean((tweet as any).is_liked),
    isBookmarked: Boolean((tweet as any).is_bookmarked),
    tags: hashtags,
    media,
    medias,
  };
};

export const formatTweets = (
  data?: InfiniteData<AxiosResponse<TweetsResponse>>,
  prevThreads: ThreadPost[] = [],
): ThreadPost[] => {
  if (!data?.pages) return [];
  // tạo map để lưu trữ các tweet đã được format
  const prevMap = new Map(prevThreads.map((item) => [item.id, item]));
  // lấy tất cả các tweet từ các page
  const serverTweets = data.pages.flatMap(
    (page) => page.data?.result?.tweets || [],
  );
  // map các tweet sang thread post nếu chưa có trong prevMap, nếu có thì giữ nguyên
  return serverTweets.map(
    (t) => prevMap.get(t._id) || formatTweetToThreadPost(t),
  );
};
