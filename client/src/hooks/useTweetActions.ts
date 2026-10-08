import { interactionsApi } from "@/apis/interactions.api";
import { tweetsApi } from "@/apis/tweets.api";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Author, ThreadPost, ThreadReply } from "@/types";

interface UseTweetActionsProps {
  threads: ThreadPost[];
  setThreads: React.Dispatch<React.SetStateAction<ThreadPost[]>>;
}

export const useTweetActions = ({
  threads,
  setThreads,
}: UseTweetActionsProps) => {
  const { showToast } = useApp();
  const { profile } = useAuth();

  const currentUser: Author = {
    id: profile._id,
    name: profile.name,
    username: profile.username?.trim() || "user",
    avatar:
      profile.avatar?.trim() ||
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
      console.log("willLike", willLike);
      if (willLike) {
        await interactionsApi.like(postId);
      } else {
        await interactionsApi.unlike(postId);
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
  const handleRepostToggle = (postId: string) => {
    setThreads((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isReposted = !p.isReposted;
          showToast(isReposted ? "Reposted to your profile" : "Removed repost");
          return {
            ...p,
            isReposted,
            repostsCount: isReposted ? p.repostsCount + 1 : p.repostsCount - 1,
          };
        }
        return p;
      }),
    );
  };

  // Reply Added
  const handleReplyAdded = (postId: string, text: string) => {
    const newReply: ThreadReply = {
      id: `reply-${Date.now()}`,
      author: currentUser,
      content: text,
      createdAt: "Just now",
      likes: 0,
      isLiked: false,
    };

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
    showToast("Reply posted");
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
  };
};
