import "@/App.css";
import { useState, useEffect } from "react";
import { ThreadCard } from "@/components/ThreadCard";
import type { ThreadPost } from "@/types";
import TopBar from "@/components/TopBar";
import { ColumnMenu } from "@/components/ColumnMenu";
import { ColumnPanel } from "@/components/ColumnPanel";
import SpoolsFound from "@/components/SpoolCard/SpoolsFound";
import { useAppStore } from "@/stores/useAppStore";
import { useTweets } from "@/hooks/useTweets";
import { formatTweets } from "@/utils/tweet.helper";
import { useTweetActions } from "@/hooks/useTweetActions";
import PostBar from "@/components/PostBar";
import useProfile from "@/hooks/useProfile";
import { ThreadListSkeleton, ThreadCardSkeleton } from "@/components/Skeleton";

const HomePage = () => {
  const { currentUser } = useProfile();
  const { columns } = useAppStore();
  const [threads, setThreads] = useState<ThreadPost[]>([]);

  const { data, isFetchingNextPage, isLoading, isError, refetch, sentinelRef } =
    useTweets({ queryKey: "feeds_post" });

  // Đồng bộ tweets từ React Query vào state threads (giữ lại trạng thái Like/Repost nếu đã bấm)
  useEffect(() => {
    if (!data) return;
    const newThreads = formatTweets(data, threads);

    // Nếu số lượng bài viết tăng lên -> có dữ liệu mới
    if (newThreads.length > threads.length) {
      setThreads(newThreads);
      return;
    }

    // Ngược lại -> chỉ update trạng thái (like/repost/bookmark)
    const updatedMap = new Map(newThreads.map((t) => [t.id, t]));
    const merged = threads.map((t) => updatedMap.get(t.id) || t);
    setThreads(merged);
  }, [data]);

  //------------- Action post -------------------

  const {
    handleLikeToggle,
    handleRepostToggle,
    handleReplyAdded,
    handleDeletePost,
    handleBookmark,
    handleShare,
  } = useTweetActions({ threads, setThreads });

  return (
    <div className="content-area" style={{ overflowX: "auto" }}>
      <div className="feed-column">
        <TopBar type="home" />
        <section className="feed-section">
          {/* Quick Add Post */}
          <PostBar />
          {/* Feeds view */}
          <div className="feed-scrollable">
            {isLoading ? (
              <ThreadListSkeleton count={4} />
            ) : isError ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "var(--text-secondary)",
                }}
              >
                <p>Không thể tải bài viết. Vui lòng thử lại!</p>
                <button
                  onClick={() => refetch()}
                  style={{
                    marginTop: "10px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Thử lại
                </button>
              </div>
            ) : threads.length > 0 ? (
              threads.map((post, index) => (
                <ThreadCard
                  key={post.id || `thread-${index}`}
                  post={post}
                  currentUser={currentUser}
                  onLikeToggle={handleLikeToggle}
                  onRepostToggle={handleRepostToggle}
                  onReplyAdded={handleReplyAdded}
                  onShare={handleShare}
                  onDelete={handleDeletePost}
                  onBookmark={handleBookmark}
                />
              ))
            ) : (
              <SpoolsFound />
            )}

            {/* Điểm neo để kích hoạt tải trang tiếp theo */}
            <div ref={sentinelRef} style={{ margin: "10px 0" }}>
              {isFetchingNextPage && <ThreadCardSkeleton />}
            </div>
          </div>
        </section>
      </div>

      {/* Column panels */}
      {columns.map((col, index) => (
        <ColumnPanel
          key={col.id || `${col.type}-${col.username || ""}-${index}`}
          id={col.id}
          type={col.type}
          label={col.label}
          username={col.username}
        />
      ))}

      <ColumnMenu />
    </div>
  );
};

export default HomePage;
