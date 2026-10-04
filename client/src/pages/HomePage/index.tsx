import { useState } from "react";
import "@/App.css";
import { ThreadCard } from "@/components/ThreadCard";
import { CURRENT_USER, INITIAL_THREADS } from "@/mockData";
import type { ThreadPost, ThreadReply } from "@/types";
import { useOutletContext } from "react-router-dom";
import type { LayoutContextType } from "@/layouts/MainLayout";
import TopBar from "@/components/TopBar";
import { ColumnMenu } from "@/components/ColumnMenu";
import SpoolsFound from "@/components/SpoolCard/SpoolsFound";

const HomePage = () => {
  const { showToast, setIsModalOpen } = useOutletContext<LayoutContextType>();
  const [threads, setThreads] = useState<ThreadPost[]>(INITIAL_THREADS);
  const [searchQuery] = useState<string>("");

  // Like Toggle
  const handleLikeToggle = (postId: string) => {
    setThreads((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      }),
    );
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
      author: CURRENT_USER,
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

  // Share link
  const handleShare = (post: ThreadPost) => {
    const fakeUrl = `https://spool.app/@${post.author.username}/post/${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fakeUrl);
    }
    showToast("Link copied to clipboard");
  };

  // Filter threads for display based on search query
  const filteredThreads = threads.filter((post) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = post.content.toLowerCase().includes(q);
      const matchAuthor =
        post.author.name.toLowerCase().includes(q) ||
        post.author.username.toLowerCase().includes(q);
      if (!matchContent && !matchAuthor) return false;
    }
    return true;
  });

  return (
    <div className="content-area">
      <main className="feed-column">
        <TopBar />
        <section className="feed-section">
          {/* Header Bar: For you */}
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
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span
                style={{
                  fontSize: "15px",
                  color: "var(--text-secondary)",
                }}
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

          {/* filter see*/}
          {/* {searchQuery && (
          <div
            style={{
              padding: "10px 16px",
              margin: "12px 16px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Filtering by:{" "}
              <b style={{ color: "var(--text-main)" }}>"{searchQuery}"</b>
            </span>
            <button
              onClick={() => setSearchQuery("")}
              style={{
                fontSize: "13px",
                color: "var(--accent-blue)",
                fontWeight: "600",
              }}
            >
              Clear
            </button>
          </div>
        )} */}

          {/* Feeds view */}
          <div className="feed-scrollable">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((post) => (
                <ThreadCard
                  key={post.id}
                  post={post}
                  currentUser={CURRENT_USER}
                  onLikeToggle={handleLikeToggle}
                  onRepostToggle={handleRepostToggle}
                  onReplyAdded={handleReplyAdded}
                  onShare={handleShare}
                />
              ))
            ) : (
              <SpoolsFound />
            )}
          </div>
        </section>
      </main>

      {/* Thêm cột bên để hiển thị các thông tin */}
      <ColumnMenu />
    </div>
  );
};

export default HomePage;
