import { interactionsApi } from "@/apis/interactions.api";
import { tweetsApi } from "@/apis/tweets.api";
import { useAppStore } from "@/stores/useAppStore";
import { useAuth } from "@/contexts/AuthContext";
import type { Author, ThreadPost, ThreadReply } from "@/types";
import { TweetAudienceType, TweetType } from "@/types/tweet.types";
import { notifications } from "@/apis/notifications.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const currentUser: Author = {
    id: profile?._id || "",
    name: profile?.name || "",
    username: profile?.username?.trim() || "user",
    avatar:
      profile?.avatar?.trim() ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    verified: true,
  };

  // -------------------------------------------------------------
  // 1. Like Mutation
  // -------------------------------------------------------------
  const likeMutation = useMutation({
    mutationFn: async ({
      postId,
      willLike,
      authorId,
    }: {
      postId: string;
      willLike: boolean;
      authorId: string | undefined;
    }) => {
      if (willLike) {
        await Promise.all([
          interactionsApi.like(postId),
          notifications.createNotification({
            senderId: profile?._id || "",
            receiverId: authorId,
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
    },
    onError: (error, { postId, willLike }) => {
      console.error("Lỗi khi like/unlike:", error);
      // Rollback UI
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
    },
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["feeds_post"] });
      queryClient.invalidateQueries({ queryKey: ["liked_posts"] });
      queryClient.invalidateQueries({ queryKey: ["tweet_detail", postId] });
    },
  });

  const handleLikeToggle = (postId: string) => {
    const targetPost = threads.find((p) => p.id === postId);
    if (!targetPost) return;
    const willLike = !targetPost.isLiked;

    // Cập nhật UI ngay lập tức (Optimistic Update)
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

    // Kích hoạt mutation đồng bộ backend và làm mới cache
    likeMutation.mutate({
      postId,
      willLike,
      authorId: targetPost.author.id,
    });
  };

  // -------------------------------------------------------------
  // 2. Repost Mutation
  // -------------------------------------------------------------
  const repostMutation = useMutation({
    mutationFn: async ({
      postId,
      willRepost,
    }: {
      postId: string;
      willRepost: boolean;
    }) => {
      const targetPost = threads.find((p) => p.id === postId);
      if (!targetPost) return;
      if (willRepost) {
        await Promise.all([
          tweetsApi.createTweet({
            type: TweetType.RETWEET,
            audience: TweetAudienceType.EVERYONE,
            content: "",
            parentId: postId,
            hashtags: [],
            mentions: [],
            medias: [],
          }),
          notifications.createNotification({
            senderId: profile?._id || "",
            receiverId: targetPost.author.id,
            type: "repost",
            tweetId: postId,
            content: "",
          }),
        ]);
      } else {
        await Promise.all([
          tweetsApi.unretweet(postId),
          notifications.deleteNotification(postId),
        ]);
      }
    },
    onSuccess: (_, { willRepost }) => {
      showToast(
        willRepost
          ? "Đã đăng lại lên trang cá nhân của bạn"
          : "Đã gỡ lượt đăng lại",
      );
    },
    onError: (error, { postId, willRepost }) => {
      console.error("Lỗi khi đăng lại / gỡ đăng lại:", error);
      // Rollback UI
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds_post"] });
      queryClient.invalidateQueries({ queryKey: ["user_posts"] });
    },
  });

  const handleRepostToggle = (postId: string) => {
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

    repostMutation.mutate({ postId, willRepost });
  };

  // -------------------------------------------------------------
  // 3. Quote
  // -------------------------------------------------------------
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

      if (targetPost.author.id && targetPost.author.id !== profile?._id) {
        notifications
          .createNotification({
            senderId: profile?._id || "",
            receiverId: targetPost.author.id,
            type: "quote",
            tweetId: postId,
            content: "",
          })
          .catch(console.error);
      }

      showToast("Đã trích dẫn lên trang cá nhân của bạn");
      queryClient.invalidateQueries({ queryKey: ["feeds_post"] });
      queryClient.invalidateQueries({ queryKey: ["user_posts"] });
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

  // -------------------------------------------------------------
  // 4. Reply Added Mutation
  // -------------------------------------------------------------
  const replyMutation = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      const targetPost = threads.find((p) => p.id === postId);

      // Luôn tạo tweet bình luận
      const response = await tweetsApi.createTweet({
        parentId: postId,
        type: TweetType.COMMENT,
        content: text,
        audience: TweetAudienceType.EVERYONE,
        hashtags: [],
        mentions: [],
        medias: [],
      });

      // Gửi thông báo cho tác giả bài viết (không gửi cho chính mình)
      if (targetPost && targetPost.author.id !== profile?._id) {
        notifications
          .createNotification({
            senderId: profile?._id || "",
            receiverId: targetPost.author.id,
            type: "comment",
            tweetId: postId,
            content: text,
          })
          .catch((err) => console.error("Lỗi gửi thông báo bình luận:", err));
      }

      return response;
    },
    onMutate: async ({ postId, text }) => {
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

      return { tempReplyId, postId };
    },
    onSuccess: (response, variables, context) => {
      if (response?.data?.data && context?.tempReplyId) {
        const createdTweet = response.data.data;
        setThreads((prev) =>
          prev.map((p) => {
            if (p.id === variables.postId) {
              return {
                ...p,
                replies: (p.replies || []).map((r) =>
                  r.id === context.tempReplyId
                    ? { ...r, id: createdTweet._id }
                    : r,
                ),
              };
            }
            return p;
          }),
        );
      }
      showToast("Đã gửi bình luận!");
      queryClient.invalidateQueries({
        queryKey: ["tweet_children", variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tweet_detail", variables.postId],
      });
    },
    onError: (error, variables, context) => {
      console.error("Lỗi khi gửi bình luận:", error);
      if (context?.tempReplyId) {
        setThreads((prev) =>
          prev.map((p) => {
            if (p.id === variables.postId) {
              return {
                ...p,
                repliesCount: Math.max(0, p.repliesCount - 1),
                replies: (p.replies || []).filter(
                  (r) => r.id !== context.tempReplyId,
                ),
              };
            }
            return p;
          }),
        );
      }
      showToast("Không thể gửi bình luận. Vui lòng thử lại!");
    },
  });

  const handleReplyAdded = async (postId: string, text: string) => {
    return replyMutation.mutateAsync({ postId, text });
  };

  // -------------------------------------------------------------
  // 5. Delete Post Mutation
  // -------------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await tweetsApi.deleteTweet(id);
    },
    onSuccess: () => {
      showToast("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["feeds_post"] });
      queryClient.invalidateQueries({ queryKey: ["user_posts"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark_posts"] });
    },
    onError: (error) => {
      console.error("Lỗi khi xóa post:", error);
      showToast("Không thể xóa post. Vui lòng thử lại!");
      queryClient.invalidateQueries({ queryKey: ["feeds_post"] });
    },
  });

  const handleDeletePost = (id: string) => {
    setThreads((prev) => prev.filter((p) => p.id !== id));
    deleteMutation.mutate(id);
  };

  // -------------------------------------------------------------
  // 6. Bookmark Mutation
  // -------------------------------------------------------------
  const bookmarkMutation = useMutation({
    mutationFn: async ({
      postId,
    }: {
      postId: string;
      willBookmark: boolean;
    }) => {
      await interactionsApi.bookmark(postId);
    },
    onSuccess: (_, { willBookmark }) => {
      showToast(willBookmark ? "Bookmark added" : "Bookmark removed");
    },
    onError: (error, { postId, willBookmark }) => {
      console.error("Lỗi khi bookmark post:", error);
      setThreads((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isBookmarked: !willBookmark,
            };
          }
          return p;
        }),
      );
      showToast("Không thể bookmark post. Vui lòng thử lại!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmark_posts"] });
      queryClient.invalidateQueries({ queryKey: ["feeds_post"] });
    },
  });

  const handleBookmark = (post: ThreadPost) => {
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

    bookmarkMutation.mutate({ postId: post.id, willBookmark });
  };

  // Share link
  const handleShare = (post: ThreadPost) => {
    const shareUrl = `https://spool.app/@${post.author.username}/post/${post.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    showToast("Link copied to clipboard");
  };
  // -------------------------------------------------------------
  // 6. Archived Mutation
  // -------------------------------------------------------------
  const archivedMutation = useMutation({
    mutationFn: async ({
      postId,
    }: {
      postId: string;
      willArchived: boolean;
    }) => {
      await tweetsApi.totalArchivedTweet(postId);
    },
    onSuccess: (_, { willArchived }) => {
      showToast(willArchived ? "Archived added" : "Archived removed");
    },
    onError: (error, { postId, willArchived }) => {
      console.error("Lỗi khi Archived post:", error);
      setThreads((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isArchived: !willArchived,
            };
          }
          return p;
        }),
      );
      showToast("Không thể archived post. Vui lòng thử lại!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds_post"] });
      queryClient.invalidateQueries({ queryKey: ["archivedOnly"] });
      queryClient.invalidateQueries({ queryKey: ["user_posts"] });
    },
  });
  const handleArchived = (post: ThreadPost) => {
    console.log("handleArchived");
    const willArchived = !post.isArchived;
    setThreads((prev) => prev.filter((p) => p.id !== post.id));

    archivedMutation.mutate({ postId: post.id, willArchived });
  };

  return {
    handleLikeToggle,
    handleRepostToggle,
    handleReplyAdded,
    handleDeletePost,
    handleBookmark,
    handleShare,
    handleQuote,
    handleArchived,
  };
};
