import { useAppStore } from "@/stores/useAppStore";
import { useAuth } from "@/contexts/AuthContext";

const PostBar = () => {
  const { setIsModalOpen } = useAppStore();
  const { profile } = useAuth();
  const currentUser = {
    id: profile?._id || "",
    name: profile?.name || "",
    username: profile?.username?.trim() || "user",
    avatar:
      profile?.avatar?.trim() ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    verified: true,
  };
  return (
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
        <span style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
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
  );
};

export default PostBar;
