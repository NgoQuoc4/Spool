import type { ApiPaginated } from "@/types/api.types";
import { formatRelativeTime } from "@/hooks/useFormatRelativeTime";
import type { ThreadPost } from "@/types";
import { TweetType, type Tweet } from "@/types/tweet.types";
import type { InfiniteData } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

export const formatTweetToThreadPost = (tweet: Tweet): ThreadPost => {
  const parent = tweet.parentTweet || (tweet as any).parent;
  // 1. Kiểm tra xem có phải là bài Retweet và có dữ liệu bài gốc không
  const isRetweet = tweet.type === TweetType.RETWEET && !!parent;
  // kiểm tra xem có phải là bài Quete và có dữ liệu bài gốc và bài mới không
  const isQuote = tweet.type === TweetType.QUOTETWEET && !!parent;

  // Nếu là retweet -> lấy thông tin bài gốc để hiển thị; nếu không -> lấy chính bài tweet
  const displayTweet = isRetweet ? parent! : tweet;

  // 2. Lấy thông tin người đã bấm Retweet (nếu có)
  const repostedBy =
    isRetweet && tweet.user
      ? {
          id: tweet.user._id,
          name: tweet.user.name,
          username: tweet.user.username?.trim() || "unknown",
          avatar:
            tweet.user.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          verified: true,
        }
      : undefined;
  // 3. Chuyển hashtags sang dạng string (lấy từ bài hiển thị)
  const hashtags: string[] = Array.isArray(displayTweet.hashtags)
    ? displayTweet.hashtags.map((hashtag: any) =>
        typeof hashtag === "string" ? hashtag : hashtag?.name || "",
      )
    : [];

  // 4. Chuyển medias sang dạng phù hợp (lấy từ bài hiển thị)
  const medias = displayTweet.medias?.map((media: any) => ({
    type: media.type as any,
    urls: [media.url],
  }));

  // Lấy media đầu tiên để hiển thị ở tweet card
  const media =
    displayTweet.medias && displayTweet.medias.length > 0
      ? {
          type: displayTweet.medias[0].type as any,
          urls: displayTweet.medias.map((m: any) => m.url),
        }
      : undefined;

  const tweetId =
    tweet._id || tweet.id || `tweet-${Date.now()}-${Math.random()}`;

  return {
    id: tweetId,
    author: {
      id:
        displayTweet.user?._id || displayTweet.user?.id || displayTweet.userId,
      name: displayTweet.user?.name || "Anonymous",
      username: displayTweet.user?.username?.trim() || "unknown",
      avatar:
        displayTweet.user?.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      verified: true,
      isFollowing: Boolean(
        displayTweet.user?.isFollowing ??
        displayTweet.isFollowing,
      ),
    },
    content: displayTweet.content,
    createdAt: displayTweet.createdAt
      ? formatRelativeTime(displayTweet.createdAt)
      : "Just now",
    likes: displayTweet.likesCount ?? displayTweet.like ?? 0,
    repliesCount: displayTweet.repliesCount ?? 0,
    repostsCount: displayTweet.repostsCount ?? 0,
    quotesCount: displayTweet.quotesCount ?? 0,
    isLiked: Boolean(displayTweet.isLiked),
    isReposted: Boolean(displayTweet.isReposted),
    isBookmarked: Boolean(displayTweet.isBookmarked),
    isQuote: Boolean(isQuote),
    quotedPost:
      isQuote && parent
        ? formatTweetToThreadPost(parent)
        : undefined,
    tags: hashtags,
    media,
    medias,
    repostedBy,
  };
};

export const formatTweets = (
  data?: InfiniteData<AxiosResponse<ApiPaginated<Tweet>>>,
  prevThreads: ThreadPost[] = [],
): ThreadPost[] => {
  if (!data?.pages) return [];
  const prevMap = new Map(prevThreads.map((item) => [item.id, item]));
  const serverTweets = data.pages.flatMap(
    (page) => page.data?.data || [],
  );

  // Lọc trùng lặp bài viết (deduplication) để tránh warning React duplicate/missing key
  const seenIds = new Set<string>();
  const uniqueServerTweets = serverTweets.filter((t) => {
    const id = t._id || (t as any).id;
    if (!id || seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  // map các tweet sang thread post nếu chưa có trong prevMap, nếu có thì giữ nguyên
  return uniqueServerTweets.map((t) => {
    const id = t._id || (t as any).id;
    return prevMap.get(id) || formatTweetToThreadPost(t);
  });
};
