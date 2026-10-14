import SpoolsFound from "@/components/SpoolCard/SpoolsFound";
import { ThreadCard } from "@/components/ThreadCard";
import TopBar from "@/components/TopBar";
import { useAppStore } from "@/stores/useAppStore";
import type { ThreadPost } from "@/types";
import { useEffect, useState } from "react";
import { useTweets } from "@/hooks/useTweets";
import { formatTweets } from "@/utils/tweet.helper";
import { useTweetActions } from "@/hooks/useTweetActions";
import useProfile from "@/hooks/useProfile";
import {
  ProfileSkeleton,
  ThreadListSkeleton,
  ThreadCardSkeleton,
} from "@/components/Skeleton";
import { usersApi } from "@/apis/users.api";

interface ProfilePageProps {
  username?: string;
  columnId?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  username: propUsername,
  columnId,
}) => {
  const { setIsModalOpen, openEditProfileModal } = useAppStore();
  const {
    user: profile,
    currentUser,
    isMyProfile,
    isLoading: isProfileLoading,
  } = useProfile(propUsername);
  const [threads, setThreads] = useState<ThreadPost[]>([]);
  const [localIsFollowing, setLocalIsFollowing] = useState<boolean | undefined>(
    undefined,
  );
  const [localFollowersCount, setLocalFollowersCount] = useState<
    number | undefined
  >(undefined);

  // Sync local follow state when profile loads
  useEffect(() => {
    if (profile) {
      setLocalIsFollowing(profile.isFollowing ?? false);
      setLocalFollowersCount(profile.followers_count ?? 0);
    }
  }, [profile?._id]);
  const { data, isFetchingNextPage, isLoading, sentinelRef, isError, refetch } =
    useTweets({
      queryKey: `profile_posts_${profile?._id}`,
      author_id: profile?._id,
      enabled: !!profile?._id,
    });

  useEffect(() => {
    if (!data) return;
    setThreads((prev) => formatTweets(data, prev));
  }, [data]);

  const handleFollow = async (type: "follow" | "unfollow") => {
    if (!profile?._id) return;
    // Optimistic update
    const following = type === "follow";
    setLocalIsFollowing(following);
    setLocalFollowersCount((prev) => (prev ?? 0) + (following ? 1 : -1));
    try {
      if (following) {
        await usersApi.follow(profile._id);
      } else {
        await usersApi.unfollow(profile._id);
      }
    } catch (error) {
      // Rollback
      setLocalIsFollowing(!following);
      setLocalFollowersCount((prev) => (prev ?? 0) + (following ? -1 : 1));
      console.error(error);
    }
  };

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
        <TopBar
          type="profile"
          columnId={columnId}
          title={profile?.name ? profile.name : undefined}
        />
        <section className="feed-section">
          <div style={{ padding: "24px 20px" }}>
            {isProfileLoading ? (
              <ProfileSkeleton />
            ) : (
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
                      {profile?.name}
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
                        @{profile?.username}
                      </span>
                    </div>
                  </div>
                  {profile?.avatar && (
                    <img
                      src={profile.avatar}
                      alt={profile?.name}
                      style={{
                        width: "74px",
                        height: "74px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--border-color)",
                      }}
                    />
                  )}
                </div>

                {profile?.bio && (
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
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {localFollowersCount ?? profile?.followers_count ?? 0}{" "}
                    followers
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {profile?.following_count ?? 0} following
                  </span>
                </div>

                {isMyProfile ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginTop: "12px",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <button
                      onClick={() => openEditProfileModal()}
                      style={{
                        backgroundColor: "var(--bg-pill)",
                        color: "var(--text-main)",
                        padding: "6px 18px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "13px",
                        border: "1px solid var(--border-color)",
                        width: "50%",
                      }}
                    >
                      Edit Profile
                    </button>
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
                        width: "50%",
                      }}
                    >
                      New spool +
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginTop: "12px",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleFollow(localIsFollowing ? "unfollow" : "follow")
                      }
                      style={{
                        backgroundColor: localIsFollowing
                          ? "var(--bg-pill)"
                          : "var(--text-main)",
                        color: localIsFollowing
                          ? "var(--text-main)"
                          : "var(--bg-main, #fff)",
                        padding: "6px 18px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "13px",
                        border: "1px solid var(--border-color)",
                        width: "50%",
                        cursor: "pointer",
                        transition: "background 0.2s, color 0.2s",
                      }}
                    >
                      {localIsFollowing ? "Following" : "Follow"}
                    </button>
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
                        width: "50%",
                      }}
                    >
                      Message
                    </button>
                  </div>
                )}
              </div>
            )}

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
                <ThreadListSkeleton count={3} />
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
          </div>
        </section>{" "}
      </div>
    </>
  );
};

export default ProfilePage;
