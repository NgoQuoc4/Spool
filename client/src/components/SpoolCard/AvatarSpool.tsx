import type { ThreadPost } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { useAuth } from "@/contexts/AuthContext";
import { PlusIcon } from "../Icons";

const AvatarSpool = ({ post }: { post: ThreadPost }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addColumn, showToast, openFollowModal, setFollowTarget } =
    useAppStore();
  const { profile: currentUser } = useAuth();

  const isMyPost = Boolean(
    currentUser &&
    (currentUser._id === post.author.id ||
      currentUser.username === post.author.username),
  );
  const isFollowing = Boolean(post.author.isFollowing);

  const handleNavigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (location.pathname === "/") {
      addColumn({
        id: `profile-${post.author.username}`,
        type: "profile",
        label: post.author.name || `@${post.author.username}`,
        username: post.author.username,
      });
      showToast(`Đã mở trang cá nhân của @${post.author.username}`);
    } else {
      navigate(`/@${post.author.username}`);
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMyPost) {
      handleNavigateToProfile(e);
      return;
    }
    setFollowTarget(post.author);
    openFollowModal();
  };

  const handleFollowTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowTarget(post.author);
    openFollowModal();
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: "42px",
        height: "42px",
      }}
    >
      <img
        src={post.author.avatar}
        alt={post.author.name}
        onClick={handleAvatarClick}
        title={
          isMyPost
            ? "Xem trang cá nhân của bạn"
            : `Xem thông tin @${post.author.username}`
        }
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          cursor: "pointer",
        }}
      />

      {/* Chỉ hiển thị nút '+' khi không phải bài của chính mình và chưa follow */}
      {!isMyPost && !isFollowing && (
        <button
          onClick={handleFollowTarget}
          title={`Follow @${post.author.username}`}
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "var(--text-main)",
            color: "var(--bg-main, #000)",
            border: "2px solid var(--bg-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.15)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <PlusIcon size={12} />
        </button>
      )}
    </div>
  );
};

export default AvatarSpool;
