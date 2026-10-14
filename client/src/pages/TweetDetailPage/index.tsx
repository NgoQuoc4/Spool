import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tweetsApi } from "@/apis/tweets.api";
import { formatTweetToThreadPost } from "@/utils/tweet.helper";
import { ThreadCard } from "@/components/ThreadCard";
import { ThreadCardSkeleton, ThreadListSkeleton } from "@/components/Skeleton";
import { useTweetActions } from "@/hooks/useTweetActions";
import useProfile from "@/hooks/useProfile";
import type { ThreadPost } from "@/types";

const TweetDetailPage: React.FC = () => {
  const { tweet_id } = useParams<{ tweet_id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useProfile();

  const [threads, setThreads] = useState<ThreadPost[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (tweetData?.data?.result) {
      list.push(formatTweetToThreadPost(tweetData.data.result));
    }

    // Các bình luận con ở sau
    if (childrenData?.data?.result?.tweets) {
      const formattedChildren = childrenData.data.result.tweets.map((t: any) =>
        formatTweetToThreadPost(t),
      );
      list.push(...formattedChildren);
    }

    setThreads(list);
  }, [tweetData?.data?.result, childrenData?.data?.result?.tweets]);

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
  const handleQuickCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !tweet_id || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await handleReplyAdded(tweet_id, commentText.trim());
      setCommentText("");
      refetchChildren();
      queryClient.invalidateQueries({ queryKey: ["tweet_detail", tweet_id] });
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
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <form
              onSubmit={handleQuickCommentSubmit}
              style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết câu trả lời của bạn..."
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
        ) : mainPost && (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            Chưa có câu trả lời nào. Hãy là người đầu tiên trả lời!
          </div>
        )}
      </section>
    </div>
  );
};

export default TweetDetailPage;
