import { VerifiedBadge } from "../Icons";
import type { ThreadPost } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";

const InforSpool = ({ post }: { post: ThreadPost }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addColumn, showToast } = useAppStore();

  const handleNavigateToProfile = () => {
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
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <span
          onClick={handleNavigateToProfile}
          style={{
            fontWeight: "700",
            fontSize: "15px",
            color: "var(--text-main)",
            letterSpacing: "-0.2px",
            cursor: "pointer",
          }}
        >
          {post.author.username}
        </span>
        {post.author.verified && <VerifiedBadge size={15} />}
        <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          • {post.createdAt}
        </span>
      </div>
    </>
  );
};

export default InforSpool;
