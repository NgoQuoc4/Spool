import { VerifiedBadge } from "../Icons";
import type { ThreadPost } from "@/types";

const InforSpool = ({ post }: { post: ThreadPost }) => {
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
          style={{
            fontWeight: "700",
            fontSize: "15px",
            color: "var(--text-main)",
            letterSpacing: "-0.2px",
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
