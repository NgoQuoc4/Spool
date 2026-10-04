import { useState } from "react";
import { CommentIcon, HeartIcon, RepostIcon, ShareIcon } from "../Icons";
import type { ThreadPost } from "@/types";

const ActionSpool = ({
  onLikeToggle,
  post,
  onRepostToggle,
  onShare,
}: {
  rIdx?: number;
  post: ThreadPost;
  onLikeToggle: (id: string) => void;
  onRepostToggle: (id: string) => void;
  onShare: (post: ThreadPost) => void;
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);

  return (
    <>
      {/* Action Buttons Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          marginTop: "6px",
          color: "var(--text-secondary)",
        }}
      >
        {/* Like button with pop animation */}
        <button
          onClick={() => onLikeToggle(post.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px",
            transition: "transform 0.15s ease",
          }}
          className={post.isLiked ? "animate-pop" : ""}
          title="Like"
        >
          <HeartIcon size={20} active={post.isLiked} />
        </button>

        {/* Comment button */}
        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px",
          }}
          title="Reply"
        >
          <CommentIcon size={20} />
        </button>

        {/* Repost button */}
        <button
          onClick={() => onRepostToggle(post.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px",
          }}
          title="Repost"
        >
          <RepostIcon size={20} active={post.isReposted} />
        </button>

        {/* Share button */}
        <button
          onClick={() => onShare(post)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px",
          }}
          title="Share"
        >
          <ShareIcon size={20} />
        </button>

        {post.createdAt.includes("left") && (
          <span
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginLeft: "auto",
            }}
          >
            {post.createdAt}
          </span>
        )}
      </div>

      {/* <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginTop: "8px",
          color: "var(--text-secondary)",
        }}
      >
        <button style={{ color: "var(--text-secondary)" }}>
          <HeartIcon size={16} />
        </button>
        <button style={{ color: "var(--text-secondary)" }}>
          <CommentIcon size={16} />
        </button>
        <button style={{ color: "var(--text-secondary)" }}>
          <RepostIcon size={16} />
        </button>
        <button style={{ color: "var(--text-secondary)" }}>
          <ShareIcon size={16} />
        </button>
      </div>
      {rIdx === 1 && post.id === "thread-0" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "10px",
            fontSize: "12px",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "13px" }}>👥</span>
          <span>Show replies</span>
        </div>
      )} */}
    </>
  );
};

export default ActionSpool;
