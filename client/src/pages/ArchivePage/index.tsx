import SpoolsFound from "@/components/SpoolCard/SpoolsFound";
import { ThreadCard } from "@/components/ThreadCard";
import TopBar from "@/components/TopBar";
import { useTweetActions } from "@/hooks/useTweetActions";
import { useTweets } from "@/hooks/useTweets";
import type { ThreadPost } from "@/types";
import { formatTweets } from "@/utils/tweet.helper";
import { useEffect, useState } from "react";
import { ThreadListSkeleton, ThreadCardSkeleton } from "@/components/Skeleton";
import useProfile from "@/hooks/useProfile";

const ArchivePage = () => {
  const [threads, setThreads] = useState<ThreadPost[]>([]);
  const { currentUser } = useProfile();

  const { data, isFetchingNextPage, isLoading, isError, refetch, sentinelRef } =
    useTweets({ queryKey: "archivedOnly", archivedOnly: "true" });

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

  const {
    handleLikeToggle,
    handleRepostToggle,
    handleReplyAdded,
    handleDeletePost,
    handleBookmark,
    handleShare,
    handleArchived,
  } = useTweetActions({ threads, setThreads });

  return (
    <>
      <div className="feed-column">
        <TopBar type="archive" />
        <section className="feed-section">
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
                  onArchived={handleArchived}
                />
              ))
            ) : (
              <SpoolsFound
                title="Không có tin nào được like"
                content="Hãy bắt đầu thả tim để khám phá nhiều tin hay!"
              />
            )}

            {/* Điểm neo để kích hoạt tải trang tiếp theo */}
            <div ref={sentinelRef} style={{ margin: "10px 0" }}>
              {isFetchingNextPage && <ThreadCardSkeleton />}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ArchivePage;
