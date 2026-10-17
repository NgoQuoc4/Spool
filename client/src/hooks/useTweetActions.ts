import { interactionsApi } from "@/apis/interactions.api";
import { tweetsApi } from "@/apis/tweets.api";
import { useAppStore } from "@/stores/useAppStore";
import { useAuth } from "@/contexts/AuthContext";
import type { Author, ThreadPost, ThreadReply } from "@/types";
import { TweetAudienceType, TweetType } from "@/types/tweet.types";
import { notifications } from "@/apis/notifications.api";

interface UseTweetActionsProps {
  threads: ThreadPost[];
  setThreads: React.Dispatch<React.SetStateAction<ThreadPost[]>>;
}

export const useTweetActions = ({
  threads,
  setThreads,
}: UseTweetActionsProps) => {
  const { showToast } = useAppStore();
  const { profile } = useAuth();

  const currentUser: Author = {
    id: profile?._id || "",
    name: profile?.name || "",
    username: profile?.username?.trim() || "user",
    avatar:
      profile?.avatar?.trim() ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    verified: true,
  };

  // Like Toggle: Optimistic Update + gọi API backend
  const handleLikeToggle = async (postId: string) => {
    const targetPost = threads.find((p) => p.id === postId);
    if (!targetPost) return;
    const willLike = !targetPost.isLiked;

    // Cập nhật UI ngay lập tức
    setThreads((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: willLike,
            likes: willLike ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      }),
    );

    // Đồng bộ lên server
    try {
      if (willLike) {
        await Promise.all([
          interactionsApi.like(postId),
          notifications.createNotification({
            senderId: profile?._id || "",
            receiverId: targetPost.author.id,
            type: "like",
            tweetId: postId,
            content: "",
          }),
        ]);
      } else {
        await Promise.all([
          interactionsApi.unlike(postId),
          notifications.deleteNotification(postId),
        ]);
      }
    } catch (error) {
      console.error("Lỗi khi like/unlike:", error);
      // Rollback lại UI nếu lỗi mạng hoặc server fail
      setThreads((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isLiked: !willLike,
              likes: !willLike ? p.likes + 1 : Math.max(0, p.likes - 1),
            };
          }
          return p;
        }),
      );
      showToast("Không thể cập nhật lượt thích. Vui lòng thử lại!");
    }
  };

  // Repost Toggle
  const handleRepostToggle = async (postId: string) => {
    // kiểm tra đã đăng lại chưa
    const targetPost = threads.find((p) => p.id === postId);
    if (!targetPost) return;
    const willRepost = !targetPost.isReposted;

    setThreads((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isReposted: willRepost,
            repostsCount: willRepost
              ? p.repostsCount + 1
              : Math.max(0, p.repostsCount - 1),
          };
        }
        return p;
      }),
    );

    try {
      if (willRepost) {
        await tweetsApi.createTweet({
          type: TweetType.RETWEET,
          audience: TweetAudienceType.EVERYONE,
          content: "",
          parentId: postId,
          hashtags: [],
          mentions: [],
          medias: [],
        });
        showToast("Đã đăng lại lên trang cá nhân của bạn");
      } else {
        await tweetsApi.unretweet(postId);
        showToast("Đã gỡ lượt đăng lại");
      }
    } catch (error) {
      console.error("Lỗi khi đăng lại / gỡ đăng lại:", error);
      setThreads((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isReposted: !willRepost,
              repostsCount: !willRepost
                ? p.repostsCount + 1
                : Math.max(0, p.repostsCount - 1),
            };
          }
          return p;
        }),
      );
      showToast("Không thể thực hiện thao tác. Vui lòng thử lại!");
    }
  };

  // Quote
  const handleQuote = async (postId: string) => {
    const targetPost = threads.find((p) => p.id === postId);
    if (!targetPost) return;
    const willQuote = !targetPost.isQuote;

    setThreads((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isQuote: willQuote,
            quotesCount: willQuote
              ? (p.quotesCount ?? 0) + 1
              : Math.max(0, (p.quotesCount ?? 0) - 1),
          };
        }
        return p;
      }),
    );

    try {
      await tweetsApi.createTweet({
        type: TweetType.QUOTETWEET,
        audience: TweetAudienceType.EVERYONE,
        content: "",
        parentId: postId,
        hashtags: [],
        mentions: [],
        medias: [],
      });
      showToast("Đã trích dẫn lên trang cá nhân của bạn");
    } catch (error) {
      console.error("Lỗi khi trích dẫn:", error);
      setThreads((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isQuote: !willQuote,
              quotesCount: !willQuote
                ? (p.quotesCount ?? 0) + 1
                : Math.max(0, (p.quotesCount ?? 0) - 1),
            };
          }
          return p;
        }),
      );
      showToast("Không thể thực hiện thao tác. Vui lòng thử lại!");
    }
  };

  // Reply Added
  const handleReplyAdded = async (postId: string, text: string) => {
    const tempReplyId = `reply-${Date.now()}`;
    const newReply: ThreadReply = {
      id: tempReplyId,
      author: currentUser,
      content: text,
      createdAt: "Just now",
      likes: 0,
      isLiked: false,
    };

    // Optimistic update
    setThreads((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            repliesCount: p.repliesCount + 1,
            replies: [...(p.replies || []), newReply],
          };
        }
        return p;
      }),
    );

    try {
      const response = await tweetsApi.createTweet({
        parentId: postId,
        type: TweetType.COMMENT,
        content: text,
        audience: TweetAudienceType.EVERYONE,
        hashtags: [],
        mentions: [],
        medias: [],
      });

      // Update real id from server if needed
      if (response?.data?.data) {
        const createdTweet = response.data.data;
        setThreads((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                replies: (p.replies || []).map((r) =>
                  r.id === tempReplyId ? { ...r, id: createdTweet._id } : r,
                ),
              };
            }
            return p;
          }),
        );
      }
      showToast("Đã gửi bình luận!");
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      // Rollback nếu có lỗi
      setThreads((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              repliesCount: Math.max(0, p.repliesCount - 1),
              replies: (p.replies || []).filter((r) => r.id !== tempReplyId),
            };
          }
          return p;
        }),
      );
      showToast("Không thể gửi bình luận. Vui lòng thử lại!");
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string) => {
    setThreads((prev) => prev.filter((p) => p.id !== id));
    try {
      await tweetsApi.deleteTweet(id);
      showToast("Post deleted");
    } catch (error) {
      console.error("Lỗi khi xóa post:", error);
      // Rollback lại nếu lỗi mạng hoặc server fail
      setThreads((prev) => {
        // Ở đây bạn sẽ cần lưu lại post đã xóa để rollback
        // Tạm thời chỉ show toast lỗi
        return prev;
      });
      showToast("Không thể xóa post. Vui lòng thử lại!");
    }
  };

  // Bookmark
  const handleBookmark = async (post: ThreadPost) => {
    const willBookmark = !post.isBookmarked;
    setThreads((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          return {
            ...p,
            isBookmarked: willBookmark,
          };
        }
        return p;
      }),
    );

    try {
      await interactionsApi.bookmark(post.id);
      showToast(willBookmark ? "Bookmark added" : "Bookmark removed");
    } catch (error) {
      console.error("Lỗi khi bookmark post:", error);
      // Rollback lại nếu lỗi mạng hoặc server fail
      setThreads((prev) => {
        // Ở đây bạn sẽ cần lưu lại post đã bookmark để rollback
        // Tạm thời chỉ show toast lỗi
        return prev;
      });
      showToast("Không thể bookmark post. Vui lòng thử lại!");
    }
  };
  // Share link
  const handleShare = (post: ThreadPost) => {
    const shareUrl = `https://spool.app/@${post.author.username}/post/${post.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    showToast("Link copied to clipboard");
  };

  return {
    handleLikeToggle,
    handleRepostToggle,
    handleReplyAdded,
    handleDeletePost,
    handleBookmark,
    handleShare,
    handleQuote,
  };
};
