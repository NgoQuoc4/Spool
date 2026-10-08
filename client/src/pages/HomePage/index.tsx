import "@/App.css";
import { useState, useEffect } from "react";
import { ThreadCard } from "@/components/ThreadCard";
import type { ThreadPost, Author } from "@/types";
import TopBar from "@/components/TopBar";
import { ColumnMenu } from "@/components/ColumnMenu";
import { ColumnPanel } from "@/components/ColumnPanel";
import SpoolsFound from "@/components/SpoolCard/SpoolsFound";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTweets } from "@/hooks/useTweets";
import { formatTweets } from "@/utils/tweet.helper";
import { useTweetActions } from "@/hooks/useTweetActions";

const HomePage = () => {
  const { profile } = useAuth();
  const { setIsModalOpen, columns } = useApp();
  const [threads, setThreads] = useState<ThreadPost[]>([]);

  const currentUser: Author = {
    id: profile._id,
    name: profile.name,
    username: profile.username?.trim() || "user",
    avatar:
      profile.avatar?.trim() ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    verified: true,
  };

  const { data, isFetchingNextPage, isLoading, isError, refetch, sentinelRef } =
    useTweets({ queryKey: "feeds" });

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
          <div
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid var(--border-color)",
              cursor: "pointer",
              backgroundColor: "var(--bg-main)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flex: 1,
              }}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span
                style={{ fontSize: "15px", color: "var(--text-secondary)" }}
              >
                What's new?
              </span>
            </div>
            <button
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Post
            </button>
          </div>

          {/* Feeds view */}
          <div className="feed-scrollable">
            {isLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "var(--text-secondary)",
                }}
              >
                Đang tải tin...
              </div>
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
              threads.map((post) => (
                <ThreadCard
                  key={post.id}
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
            <div ref={sentinelRef} style={{ height: "20px", margin: "10px 0" }}>
              {isFetchingNextPage && (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  Đang tải thêm...
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Column panels */}
      {columns.map((col) => (
        <ColumnPanel key={col.type} type={col.type} label={col.label} />
      ))}

      <ColumnMenu />
    </div>
  );
};

export default HomePage;
