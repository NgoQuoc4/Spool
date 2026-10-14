import { useState } from "react";
import {
  BookmarkIcon,
  CommentIcon,
  HeartIcon,
  QuoteIcon,
  RepostIcon,
  ShareIcon,
} from "../Icons";
import type { ThreadPost } from "@/types";
import { useAppStore } from "@/stores/useAppStore";

const ActionSpool = ({
  onLikeToggle,
  post,
  onRepostToggle,
  onShare,
  onBookmark,
  onCommentClick,
  isReposted,
}: {
  rIdx?: number;
  post: ThreadPost;
  onLikeToggle?: (id: string) => void;
  onRepostToggle?: (id: string) => void;
  onShare: (post: ThreadPost) => void;
  onBookmark: (post: ThreadPost) => void;
  onCommentClick?: () => void;
  isReposted?: boolean;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Trong component ActionSpool:
  const { openQuoteModal } = useAppStore();
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
          onClick={() => onLikeToggle?.(post.id)}
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

        {/* Comment button: Toggle reply box inline thay vì chuyển link */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick?.();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px",
          }}
          title="Reply"
        >
          <CommentIcon size={20} />
          {post.repliesCount > 0 && (
            <span style={{ fontSize: "13px" }}>{post.repliesCount}</span>
          )}
        </button>

        {/* Repost button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
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
          {showMenu && (
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: "32px",
                backgroundColor: "var(--bg-modal)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                boxShadow: "var(--shadow-popup)",
                padding: "6px",
                zIndex: 20,
                minWidth: "160px",
              }}
            >
              <button
                onClick={() => {
                  onRepostToggle?.(post.id);
                  setShowMenu(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  color: isReposted ? "red" : "var(--text-main)",
                  display: "block",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-pill)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {isReposted ? <span>Remove</span> : <span>Repost</span>}
                  <RepostIcon size={18} />
                </div>
              </button>

              <button
                onClick={() => {
                  openQuoteModal(post);
                  setShowMenu(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  color: "var(--text-secondary)",
                  display: "block",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-pill)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Quote</span>
                  <QuoteIcon size={18} />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Bookmark button */}
        <button
          onClick={() => onBookmark(post)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px",
          }}
          title="Bookmark"
        >
          <BookmarkIcon size={20} active={post.isBookmarked} />
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
