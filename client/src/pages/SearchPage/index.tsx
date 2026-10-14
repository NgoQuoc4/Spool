import {
  CalendarAfterIcon,
  CalendarBeforeIcon,
  FilterIcon,
  SearchIcon,
  VerifiedBadge,
} from "@/components/Icons";
import TopBar from "@/components/TopBar";
import { INITIAL_SUGGESTIONS } from "@/mockData";
import React, { useEffect, useRef, useState } from "react";
import { searchApi } from "@/apis/search.api";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { ThreadCard } from "@/components/ThreadCard";
import { formatTweetToThreadPost } from "@/utils/tweet.helper";
import { useTweetActions } from "@/hooks/useTweetActions";
import type { ThreadPost } from "@/types";
import { ThreadListSkeleton, UserListSkeleton } from "@/components/Skeleton";
import useProfile from "@/hooks/useProfile";
import { Link } from "react-router-dom";
import { usersApi } from "@/apis/users.api";

type SearchTab = "top" | "recent" | "profiles";

const TABS: { key: SearchTab; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "recent", label: "Recent" },
  { key: "profiles", label: "Profiles" },
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("top");
  const [isOpen, setIsOpen] = useState(false);
  const [threads, setThreads] = useState<ThreadPost[]>([]);

  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const debouncedSearch = useDebounce(searchQuery.trim(), 400);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useProfile();

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const {
    data: searchResults,
    isLoading,
  } = useQuery({
    queryKey: ["search", debouncedSearch, activeTab],
    queryFn: () =>
      searchApi.searchUsers({
        query: debouncedSearch,
        tab: activeTab,
      }),
    enabled: debouncedSearch.length > 0,
  });

  const handleFollow = async (e: React.MouseEvent, profile: any) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = profile?.id || profile?._id;
    if (!targetId) return;

    // Trạng thái hiện tại của user này (ưu tiên state local, sau đó đến data từ backend)
    const isCurrentlyFollowing =
      followingMap[targetId] ??
      profile.isFollowing ??
      profile.is_following ??
      false;

    const nextState = !isCurrentlyFollowing;

    // Optimistic update cho riêng user này
    setFollowingMap((prev) => ({ ...prev, [targetId]: nextState }));

    try {
      if (nextState) {
        await usersApi.follow(targetId);
      } else {
        await usersApi.unfollow(targetId);
      }
    } catch (error) {
      // Rollback nếu API lỗi
      setFollowingMap((prev) => ({
        ...prev,
        [targetId]: isCurrentlyFollowing,
      }));
      console.error("Lỗi khi follow/unfollow:", error);
    }
  };

  const users =
    searchResults?.data?.users ||
    (Array.isArray(searchResults?.data) ? searchResults.data : []);

  useEffect(() => {
    if (searchResults?.data?.tweets) {
      const formatted = searchResults.data.tweets.map((t: any) =>
        formatTweetToThreadPost(t),
      );
      setThreads(formatted);
    } else {
      setThreads([]);
    }
  }, [searchResults?.data?.tweets]);

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
        <TopBar type="search" />
        <section className="feed-section">
          {/* Search Header Bar */}
          <div style={{ padding: "12px 16px 8px 16px" }}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "var(--bg-input)",
                  padding: "10px 16px",
                  borderRadius: "9999px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <SearchIcon size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search accounts, topics and keywords..."
                  autoFocus
                  style={{
                    flex: 1,
                    fontSize: "15px",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                  }}
                />
                <div className="filter-options-wrapper" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-secondary)",
                      transition: "color 0.15s ease",
                    }}
                    title="Filter search"
                  >
                    <FilterIcon size={20} />
                  </button>

                  {isOpen && (
                    <div className="filter-dropdown-menu">
                      <button className="filter-dropdown-item">
                        <span>Trước ngày</span>
                        <CalendarBeforeIcon size={18} />
                      </button>
                      <button className="filter-dropdown-item">
                        <span>Sau ngày</span>
                        <CalendarAfterIcon size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Navigation Tabs (Top, Recent, Profiles) */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-main)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: "16px 0 0 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: isActive ? "700" : "500",
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      paddingBottom: "14px",
                      position: "relative",
                    }}
                  >
                    {tab.label}
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          backgroundColor: "var(--accent-white, #ffffff)",
                          borderRadius: "9999px",
                        }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {isLoading ? (
              activeTab === "profiles" ? (
                <UserListSkeleton count={5} />
              ) : (
                <ThreadListSkeleton count={4} />
              )
            ) : (
              <>
                {/* TAB 1: TOP */}
                {activeTab === "top" && (
                  <div>
                    {!searchQuery ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "60px 20px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Nhập từ khóa để tìm kiếm bài viết nổi bật
                      </div>
                    ) : threads.length > 0 ? (
                      threads.map((post, index) => (
                        <ThreadCard
                          key={post.id || `search-post-${index}`}
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
                      <p
                        style={{
                          textAlign: "center",
                          color: "var(--text-secondary)",
                          padding: "40px 20px",
                        }}
                      >
                        Không tìm thấy bài viết nào
                      </p>
                    )}
                  </div>
                )}

                {/* TAB 2: RECENT */}
                {activeTab === "recent" && (
                  <div>
                    {!searchQuery ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "60px 20px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Nhập từ khóa để tìm kiếm bài viết mới nhất
                      </div>
                    ) : threads.length > 0 ? (
                      threads.map((post, index) => (
                        <ThreadCard
                          key={post.id || `search-recent-${index}`}
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
                      <p
                        style={{
                          textAlign: "center",
                          color: "var(--text-secondary)",
                          padding: "40px 20px",
                        }}
                      >
                        Không tìm thấy bài viết nào
                      </p>
                    )}
                  </div>
                )}

                {/* TAB 3: PROFILES */}
                {activeTab === "profiles" && (
                  <div>
                    {!searchQuery ? (
                      <div>
                        <h4
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "var(--text-primary)",
                            padding: "16px 20px",
                            borderBottom: "1px solid var(--border-subtle)",
                          }}
                        >
                          Gợi ý cho bạn
                        </h4>
                        {INITIAL_SUGGESTIONS.map((s) => (
                          <div
                            key={s.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 20px",
                              borderBottom: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--bg-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <img
                                src={s.avatar}
                                alt={s.name}
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: "700",
                                      fontSize: "15px",
                                    }}
                                  >
                                    {s.username}
                                  </span>
                                  {s.verified && <VerifiedBadge size={14} />}
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {s.name} · {s.followers} followers
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                backgroundColor: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "9999px",
                                padding: "6px 16px",
                                fontWeight: "700",
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "var(--bg-hover)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "var(--bg-secondary)";
                              }}
                            >
                              Follow
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : users && users.length > 0 ? (
                      users.map((s: any, index: number) => {
                        const userId = s.id || s._id;
                        const isMe = currentUser?.id === userId;
                        const isFollowing =
                          followingMap[userId] ??
                          s.isFollowing ??
                          s.is_following ??
                          false;

                        return (
                          <div
                            key={s._id || s.id || `search-user-${index}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 20px",
                              borderBottom: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--bg-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <Link
                                style={{
                                  color: "inherit",
                                  textDecoration: "none",
                                }}
                                to={`/@${s.username}`}
                              >
                                <img
                                  src={
                                    s.avatar ||
                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                                  }
                                  alt={s.name}
                                  style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              </Link>

                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: "700",
                                      fontSize: "15px",
                                    }}
                                  >
                                    <Link
                                      style={{
                                        color: "inherit",
                                        textDecoration: "none",
                                      }}
                                      to={`/@${s.username}`}
                                    >
                                      {s.name}
                                    </Link>
                                  </span>
                                  {s.verified && <VerifiedBadge size={14} />}
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  <Link
                                    style={{
                                      color: "inherit",
                                      textDecoration: "none",
                                    }}
                                    to={`/@${s.username}`}
                                  >
                                    {s.name}
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {!isMe && (
                              <button
                                onClick={(e) => handleFollow(e, s)}
                                style={{
                                  backgroundColor: isFollowing
                                    ? "var(--bg-pill)"
                                    : "var(--text-main)",
                                  color: isFollowing
                                    ? "var(--text-main)"
                                    : "var(--bg-main, #fff)",
                                  padding: "6px 18px",
                                  borderRadius: "10px",
                                  fontWeight: "600",
                                  fontSize: "13px",
                                  border: "1px solid var(--border-color)",
                                  cursor: "pointer",
                                  width: "100px",
                                  transition: "background 0.2s, color 0.2s",
                                }}
                              >
                                {isFollowing ? "Following" : "Follow"}
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p
                        style={{
                          textAlign: "center",
                          color: "var(--text-secondary)",
                          padding: "40px 20px",
                        }}
                      >
                        Không tìm thấy người dùng nào
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default SearchPage;
