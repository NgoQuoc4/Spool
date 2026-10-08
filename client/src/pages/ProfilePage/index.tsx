import SpoolsFound from "@/components/SpoolCard/SpoolsFound";
import { ThreadCard } from "@/components/ThreadCard";
import TopBar from "@/components/TopBar";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Author, ThreadPost } from "@/types";
import { useEffect, useState } from "react";
import { useTweets } from "@/hooks/useTweets";
import { formatTweets } from "@/utils/tweet.helper";
import { useTweetActions } from "@/hooks/useTweetActions";

const ProfilePage = () => {
  const { profile } = useAuth();
  const { setIsModalOpen } = useApp();
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
    useTweets({
      queryKey: "tweets",
      author_id: profile?._id,
      enabled: Boolean(profile?._id),
    });

  useEffect(() => {
    if (!data) return;
    setThreads((prev) => formatTweets(data, prev));
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
    <>
      <div className="feed-column">
        <TopBar type="profile" />
        <section className="feed-section">
          <div style={{ padding: "24px 20px" }}>
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid var(--border-color)",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "var(--text-main)",
                      margin: "0 0 4px",
                    }}
                  >
                    {profile.name}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {profile.username}
                    </span>
                  </div>
                </div>
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{
                    width: "74px",
                    height: "74px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--border-color)",
                  }}
                />
              </div>

              <p
                style={{
                  marginTop: "16px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "var(--text-main)",
                }}
              >
                {profile.bio}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {profile.followers_count} followers
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {profile.following_count} following
                  </span>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    backgroundColor: "var(--bg-pill)",
                    color: "var(--text-main)",
                    padding: "6px 18px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "13px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  New spool +
                </button>
              </div>
            </div>

            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                marginBottom: "12px",
                color: "var(--text-secondary)",
                paddingLeft: "4px",
              }}
            >
              Threads
            </h4>

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
              <div
                ref={sentinelRef}
                style={{ height: "20px", margin: "10px 0" }}
              >
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
          </div>
        </section>{" "}
      </div>
    </>
  );
};

export default ProfilePage;
