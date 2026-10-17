import { useAppStore } from "@/stores/useAppStore";
import { usersApi } from "@/apis/users.api";
import { useEffect, useState } from "react";

const FollowModal = () => {
  const { showToast, followTarget, isModalFollowOpen, closeFollowModal } =
    useAppStore();

  const [localIsFollowing, setLocalIsFollowing] = useState<boolean | undefined>(
    undefined,
  );
  const [localFollowersCount, setLocalFollowersCount] = useState<
    number | undefined
  >(undefined);
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (followTarget && followTarget.id) {
      setLocalIsFollowing(followTarget.isFollowing ?? false);
      setLocalFollowersCount(followTarget.followersCount ?? 0);
    }
  }, [
    followTarget?.id,
    followTarget?.isFollowing,
    followTarget?.followersCount,
  ]);

  if (!isModalFollowOpen || !followTarget?.id) return null;

  const profile = {
    id: followTarget.id,
    name: followTarget.name,
    username: followTarget.username,
    avatar: followTarget.avatar,
    bio: followTarget.bio,
    followersCount: followTarget.followersCount,
    followingCount: followTarget.followingCount,
    isFollowing: followTarget.isFollowing,
  };

  const handleFollow = async (type: "follow" | "unfollow") => {
    if (!profile?.id || isSubmitting) return;
    const following = type === "follow";

    setIsSubmitting(true);
    // Optimistic Update: Follow -> +1, Unfollow -> -1
    setLocalIsFollowing(following);
    setLocalFollowersCount((prev) =>
      Math.max(0, (prev ?? 0) + (following ? 1 : -1)),
    );

    try {
      if (type === "follow") {
        await usersApi.follow(profile.id);
        showToast(`Đã theo dõi @${profile.username}`);
      } else {
        await usersApi.unfollow(profile.id);
        showToast(`Đã hủy theo dõi @${profile.username}`);
      }
    } catch (error) {
      // Rollback nếu có lỗi
      setLocalIsFollowing(!following);
      setLocalFollowersCount((prev) =>
        Math.max(0, (prev ?? 0) + (following ? -1 : 1)),
      );
      showToast("Thao tác thất bại, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
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
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeFollowModal();
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "18px",
          padding: "24px",
          border: "1px solid var(--border-color)",
          marginBottom: "16px",
          maxWidth: "620px",
          minWidth: "480px",
          width: "100%",
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
                @{profile.username}
              </span>
            </div>
          </div>
          {profile.avatar && (
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
          )}
        </div>

        {profile.bio && (
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
            marginTop: "14px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            {localFollowersCount ?? profile.followersCount ?? 0} followers
          </span>
          <span
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            {profile.followingCount ?? 0} following
          </span>
        </div>
        <div
          style={{
            height: "1px",
            margin: "20px 0px",
            backgroundColor: "var(--border-color)",
          }}
        />
        <button
          onClick={() => handleFollow(localIsFollowing ? "unfollow" : "follow")}
          disabled={isSubmitting}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="button"
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: "999px",
            border: localIsFollowing
              ? isHovered
                ? "1px solid #ef4444"
                : "1px solid var(--border-color)"
              : "none",
            backgroundColor: localIsFollowing
              ? isHovered
                ? "rgba(239, 68, 68, 0.1)"
                : "transparent"
              : "var(--text-main)",
            color: localIsFollowing
              ? isHovered
                ? "#ef4444"
                : "var(--text-main)"
              : "var(--bg-main, #fff)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "700",
            transition: "all 0.15s ease",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {localIsFollowing ? (isHovered ? "Unfollow" : "Following") : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default FollowModal;
