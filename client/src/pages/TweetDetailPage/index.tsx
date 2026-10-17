import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tweetsApi } from "@/apis/tweets.api";
import { notifications } from "@/apis/notifications.api";
import { formatTweetToThreadPost } from "@/utils/tweet.helper";
import { ThreadCard } from "@/components/ThreadCard";
import { ThreadCardSkeleton, ThreadListSkeleton } from "@/components/Skeleton";
import { useTweetActions } from "@/hooks/useTweetActions";
import useProfile from "@/hooks/useProfile";
import type { ThreadPost } from "@/types";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

const TweetDetailPage: React.FC = () => {
  const { tweet_id } = useParams<{ tweet_id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useProfile();

  const [threads, setThreads] = useState<ThreadPost[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cuộn lên đầu trang mỗi khi chuyển sang xem bài viết khác
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tweet_id]);

  // 1. Query bài viết gốc
  const {
    data: tweetData,
    isLoading: isTweetLoading,
    isError: isTweetError,
  } = useQuery({
    queryKey: ["tweet_detail", tweet_id],
    queryFn: () => tweetsApi.getTweet(tweet_id as string),
    enabled: !!tweet_id,
  });

  // 2. Query danh sách bình luận con
  const {
    data: childrenData,
    isLoading: isChildrenLoading,
    refetch: refetchChildren,
  } = useQuery({
    queryKey: ["tweet_children", tweet_id],
    queryFn: () => tweetsApi.getTweetChildren(tweet_id as string),
    enabled: !!tweet_id,
  });

  // Đồng bộ bài viết gốc & danh sách bình luận vào state threads
  useEffect(() => {
    const list: ThreadPost[] = [];

    // Bài viết gốc ở đầu danh sách (index 0)
    const rawTweet = tweetData?.data?.data;
    if (rawTweet) {
      list.push(formatTweetToThreadPost(rawTweet));
    }

    // Các bình luận con ở sau
    const rawChildren = childrenData?.data?.data;

    if (rawChildren && Array.isArray(rawChildren)) {
      const formattedChildren = rawChildren.map((t: any) =>
        formatTweetToThreadPost(t),
      );
      list.push(...formattedChildren);
    }

    setThreads(list);
  }, [tweetData?.data?.data, childrenData?.data?.data]);

  // Hook quản lý like, repost, bookmark, reply, delete
  const {
    handleLikeToggle,
    handleRepostToggle,
    handleReplyAdded,
    handleDeletePost,
    handleBookmark,
    handleShare,
  } = useTweetActions({ threads, setThreads });

  const mainPost = threads[0];
  const replies = threads.slice(1);

  // Xử lý gửi bình luận từ khung soạn thảo nhanh
  const handleQuickCommentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || !tweet_id || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 1. Optimistic Update: Thêm ngay bình luận mới vào danh sách hiển thị
      const tempId = `temp-reply-${Date.now()}`;
      const optimisticReply: ThreadPost = {
        id: tempId,
        author: {
          id: currentUser.id || "me",
          name: currentUser.name || "You",
          username: currentUser.username || "you",
          avatar: currentUser.avatar || DEFAULT_AVATAR,
          verified: currentUser.verified ?? true,
        },
        content: trimmed,
        createdAt: "Vừa xong",
        likes: 0,
        repliesCount: 0,
        repostsCount: 0,
        isLiked: false,
        isReposted: false,
        isBookmarked: false,
        medias: [],
      };

      setThreads((prev) => {
        if (prev.length === 0) return [optimisticReply];
        // Tăng repliesCount của bài chính và đưa reply mới lên đầu danh sách replies
        const updatedMain = {
          ...prev[0],
          repliesCount: prev[0].repliesCount + 1,
        };
        return [updatedMain, optimisticReply, ...prev.slice(1)];
      });

      setCommentText("");

      // 2. Gọi API tạo bình luận
      await handleReplyAdded(tweet_id, trimmed);

      // 3. Bắn thông báo cho tác giả bài viết nếu bình luận vào bài người khác
      if (mainPost?.author?.id && mainPost.author.id !== currentUser.id) {
        notifications
          .createNotification({
            senderId: currentUser.id || "",
            receiverId: mainPost.author.id,
            type: "comment",
            tweetId: tweet_id,
            content: trimmed,
          })
          .catch((err) => console.error("Lỗi khi tạo thông báo cmt:", err));
      }

      // 4. Refetch lại danh sách replies để đồng bộ dữ liệu thật từ Server
      await refetchChildren();
      queryClient.invalidateQueries({ queryKey: ["tweet_detail", tweet_id] });
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feed-column">
      {/* Header with Back Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border-color)",
          position: "sticky",
          top: 0,
          backgroundColor: "var(--bg-main)",
          zIndex: 10,
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-main)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "50%",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          title="Quay lại"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            margin: 0,
            color: "var(--text-main)",
          }}
        >
          Bài viết
        </h2>
      </div>

      <section className="feed-section">
        {/* Loading state bài viết chính */}
        {isTweetLoading && (
          <div style={{ padding: "16px 20px" }}>
            <ThreadCardSkeleton />
          </div>
        )}

        {/* Lỗi không tìm thấy bài viết */}
        {isTweetError && !isTweetLoading && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <p style={{ fontSize: "16px", fontWeight: "600" }}>
              Không tìm thấy bài viết
            </p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
              Bài viết này có thể đã bị xóa hoặc không còn tồn tại.
            </p>
          </div>
        )}

        {/* Hiển thị bài viết chính */}
        {mainPost && (
          <div
            style={{
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <ThreadCard
              post={mainPost}
              currentUser={currentUser}
              onLikeToggle={handleLikeToggle}
              onRepostToggle={handleRepostToggle}
              onReplyAdded={handleReplyAdded}
              onShare={handleShare}
              onDelete={(id) => {
                handleDeletePost(id);
                navigate("/");
              }}
              onBookmark={handleBookmark}
            />
          </div>
        )}

        {/* Khung soạn thảo bình luận */}
        {mainPost && (
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <img
              src={currentUser.avatar || DEFAULT_AVATAR}
              alt={currentUser.name}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <form
              onSubmit={handleQuickCommentSubmit}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  // Nhấn Ctrl+Enter hoặc Cmd+Enter để gửi nhanh
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleQuickCommentSubmit();
                  }
                }}
                placeholder="Viết câu trả lời của bạn... (Ctrl+Enter để gửi)"
                rows={2}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-main)",
                  fontSize: "15px",
                  lineHeight: "1.5",
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  style={{
                    backgroundColor: "var(--text-main)",
                    color: "var(--bg-main)",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "6px 18px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor:
                      !commentText.trim() || isSubmitting
                        ? "not-allowed"
                        : "pointer",
                    opacity: !commentText.trim() || isSubmitting ? 0.5 : 1,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  {isSubmitting ? "Đang gửi..." : "Trả lời"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách bình luận con */}
        {isChildrenLoading ? (
          <div style={{ padding: "16px 20px" }}>
            <ThreadListSkeleton />
          </div>
        ) : replies.length > 0 ? (
          <div>
            <div
              style={{
                padding: "12px 20px 4px",
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--text-secondary)",
              }}
            >
              Bình luận ({replies.length})
            </div>
            {replies.map((replyPost) => (
              <div
                key={replyPost.id}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <ThreadCard
                  post={replyPost}
                  currentUser={currentUser}
                  onLikeToggle={handleLikeToggle}
                  onRepostToggle={handleRepostToggle}
                  onReplyAdded={handleReplyAdded}
                  onShare={handleShare}
                  onDelete={handleDeletePost}
                  onBookmark={handleBookmark}
                />
              </div>
            ))}
          </div>
        ) : (
          mainPost && (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              Chưa có câu trả lời nào. Hãy là người đầu tiên trả lời!
            </div>
          )
        )}
      </section>
    </div>
  );
};

export default TweetDetailPage;
