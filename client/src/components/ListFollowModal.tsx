import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { usersApi } from "@/apis/users.api";
import { VerifiedBadge } from "./Icons";
import useFollowMutation from "@/hooks/useFollowMutation";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

const ListFollowModal = () => {
  const navigate = useNavigate();
  const followMutation = useFollowMutation();
  const { listFollowModal, closeListFollowModal } = useAppStore();

  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    "followers",
  );
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  // Cập nhật tab mặc định khi modal mở
  useEffect(() => {
    if (listFollowModal?.initialTab) {
      setActiveTab(listFollowModal.initialTab);
    }
  }, [listFollowModal]);

  // Chỉ fetch dữ liệu của đúng tab đang chọn, tự động cache 1 phút
  const { data, isLoading } = useQuery({
    queryKey: ["follow-list", listFollowModal?.userId, activeTab],
    queryFn: () =>
      activeTab === "followers"
        ? usersApi.followers(listFollowModal!.userId)
        : usersApi.following(listFollowModal!.userId),
    enabled: Boolean(listFollowModal?.userId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!listFollowModal) return null;

  const userList: any[] = data?.data?.data || [];

  const handleToggleFollow = async (user: any) => {
    const targetId = user.id || user.followedUserId || user.followerUserId;
    if (!targetId) return;

    const isCurrentlyFollowing =
      followingMap[targetId] !== undefined
        ? followingMap[targetId]
        : activeTab === "following";

    const nextState = !isCurrentlyFollowing;
    setFollowingMap((prev) => ({ ...prev, [targetId]: nextState }));

    followMutation.mutate(
      {
        targetId,
        isFollowing: isCurrentlyFollowing, // trạng thái hiện tại (nếu true thì unfollow, nếu false thì follow)
      },
      {
        onError: () => {
          // Rollback nếu API lỗi
          setFollowingMap((prev) => ({
            ...prev,
            [targetId]: isCurrentlyFollowing,
          }));
        },
      },
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeListFollowModal();
      }}
    >
      <div
        className="animate-modal"
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "var(--bg-modal, #181818)",
          borderRadius: "20px",
          border: "1px solid var(--border-color, #282828)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "60vh",
        }}
      >
        {/* --- HEADER TABS --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--border-color, #282828)",
            position: "relative",
          }}
        >
          {(
            [
              { key: "followers", label: "Followers" },
              { key: "following", label: "Following" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: "16px 8px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: isActive
                    ? "var(--text-primary, #ffffff)"
                    : "var(--text-secondary, #777777)",
                  position: "relative",
                  transition: "color 0.15s ease",
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
                      height: "2px",
                      backgroundColor: "var(--text-primary, #ffffff)",
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* Nút đóng (X) */}
          <button
            onClick={closeListFollowModal}
            aria-label="Close"
            style={{
              position: "absolute",
              right: "12px",
              background: "transparent",
              border: "none",
              color: "var(--text-secondary, #888)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* --- DANH SÁCH USER --- */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: "220px",
            maxHeight: "55vh",
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: "20px",
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-secondary, #282828)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: "120px",
                        height: "14px",
                        borderRadius: "4px",
                        backgroundColor: "var(--bg-secondary, #282828)",
                        marginBottom: "6px",
                      }}
                    />
                    <div
                      style={{
                        width: "80px",
                        height: "12px",
                        borderRadius: "4px",
                        backgroundColor: "var(--bg-secondary, #282828)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : userList.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "var(--text-secondary, #777777)",
                fontSize: "14px",
              }}
            >
              {activeTab === "followers"
                ? "Chưa có người theo dõi nào"
                : "Chưa theo dõi người dùng nào"}
            </div>
          ) : (
            userList.map((user: any) => {
              const userId =
                user.id || user.followedUserId || user.followerUserId;
              const isFollowing =
                followingMap[userId] !== undefined
                  ? followingMap[userId]
                  : activeTab === "following";

              return (
                <div
                  key={userId}
                  onClick={() => {
                    closeListFollowModal();
                    navigate(`/@${user.username}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-hover, rgba(255, 255, 255, 0.04))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Trái: Avatar & Username/Name */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: 0,
                    }}
                  >
                    <img
                      src={user.avatar || DEFAULT_AVATAR}
                      alt={user.name || user.username}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        backgroundColor: "var(--bg-secondary, #282828)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
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
                            color: "var(--text-primary, #ffffff)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user.username}
                        </span>
                        {user.verified && <VerifiedBadge size={14} />}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary, #777777)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: "2px",
                        }}
                      >
                        {user.name || `@${user.username}`}
                      </div>
                    </div>
                  </div>

                  {/* Phải: Nút Follow / Following */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFollow(user);
                    }}
                    style={{
                      backgroundColor: isFollowing
                        ? "transparent"
                        : "var(--btn-follow-bg, #ffffff)",
                      color: isFollowing
                        ? "var(--text-primary, #ffffff)"
                        : "var(--btn-follow-color, #000000)",
                      border: isFollowing
                        ? "1px solid var(--border-color, #444444)"
                        : "none",
                      borderRadius: "10px",
                      padding: "7px 18px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                      marginLeft: "12px",
                    }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ListFollowModal;
