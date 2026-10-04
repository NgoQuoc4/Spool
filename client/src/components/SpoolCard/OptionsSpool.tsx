import { useState } from "react";
import { MoreDotsIcon } from "../Icons";
import type { ThreadPost } from "@/types";

const OptionsSpool = ({
  post,
  onShare,
}: {
  post: ThreadPost;
  onShare: (post: ThreadPost) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            color: "var(--text-secondary)",
            padding: "4px 6px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-main)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
        >
          <MoreDotsIcon size={18} />
        </button>

        {showMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "28px",
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
                onShare(post);
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "8px",
                color: "var(--text-main)",
                display: "block",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-pill)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Copy link
            </button>
            <button
              onClick={() => setShowMenu(false)}
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
              Unfollow @{post.author.username}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default OptionsSpool;
