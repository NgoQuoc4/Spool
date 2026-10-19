import { useState, useRef, useEffect } from "react";
import { MoreDotsIcon } from "../Icons";
import type { ThreadPost } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const OptionsSpool = ({
  post,
  onShare,
  onDelete,
}: {
  post: ThreadPost;
  onShare: (post: ThreadPost) => void;
  onDelete: (id: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const isAuthor = Boolean(profile?._id && profile._id === post.author.id);

  // Đóng menu khi click ra bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <>
      <div ref={menuRef} style={{ position: "relative" }}>
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

            {!isAuthor && (
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
            )}

            {isAuthor && (
              <button
                onClick={() => {
                  onDelete(post.id);
                  setShowMenu(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  color: "var(--error-color)",
                  display: "block",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--bg-error-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OptionsSpool;
