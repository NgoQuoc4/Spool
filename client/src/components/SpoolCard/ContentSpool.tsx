import type { ThreadPost } from "@/types";
import { Link } from "react-router-dom";

export const renderFormattedContent = (content: string) => {
  if (!content) return null;

  // Tách link URL (http:// hoặc https://)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, pIdx) => {
    if (part.match(/^https?:\/\//i)) {
      return (
        <a
          key={`url-${pIdx}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: "var(--accent-blue)",
            textDecoration: "underline",
            wordBreak: "break-all",
            cursor: "pointer",
          }}
        >
          {part}
        </a>
      );
    }

    // Tách hashtag và mention trong các phần chữ thông thường
    const tagRegex =
      /(#[a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+|@[a-zA-Z0-9_]+)/g;
    const tokens = part.split(tagRegex);

    return tokens.map((token, tIdx) => {
      if (token.startsWith("@")) {
        const username = token.slice(1);
        return (
          <Link
            key={`mention-${pIdx}-${tIdx}`}
            to={`/@${username}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              color: "var(--accent-blue)",
              fontWeight: "500",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            {token}
          </Link>
        );
      }
      if (token.startsWith("#")) {
        const username = token.slice(1);
        return (
          <Link
            key={`tag-${pIdx}-${tIdx}`}
            to={`/search?q=${username}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              color: "var(--accent-blue)",
              fontWeight: "500",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            {token}
          </Link>
        );
      }
      return token;
    });
  });
};

const ContentSpool = ({ post }: { post: ThreadPost }) => {
  return (
    <>
      {/* Post Content */}
      {post.id === "thread-0" ? (
        <div
          style={{
            display: "inline-block",
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "20px",
            padding: "10px 18px",
            fontSize: "15px",
            lineHeight: "1.4",
            color: "var(--text-main)",
            margin: "4px 0 10px",
          }}
        >
          {renderFormattedContent(post.content)}
        </div>
      ) : (
        <div
          style={{
            fontSize: "15px",
            lineHeight: "1.5",
            color: "var(--text-main)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            marginBottom: "10px",
            border: `${post.isGhost === true ? "dotted" : "none"} 2px var(--border-color)`,
            borderRadius: "10px",
            padding: `${post.isGhost === true ? "10px" : "0px"}`,
          }}
        >
          {renderFormattedContent(post.content)}
        </div>
      )}
    </>
  );
};

export default ContentSpool;
