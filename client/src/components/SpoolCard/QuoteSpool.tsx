import type { ThreadPost } from "@/types";
import { renderFormattedContent } from "./ContentSpool";

interface QuoteSpoolProps {
  post: ThreadPost;
}

const QuoteSpool = ({ post }: QuoteSpoolProps) => {
  const imageUrl = post.media?.urls?.[0];

  return (
    <div
      style={{
        marginTop: "10px",
        marginBottom: "10px",
        padding: "12px 14px",
        borderRadius: "14px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-card)",
        cursor: "pointer",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--border-subtle, #555)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border-color)")
      }
    >
      {/* Header bài gốc: Avatar, Tên, Username, Thời gian */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <img
          src={
            post.author.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
          }
          alt={post.author.name}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <span
          style={{
            fontWeight: "600",
            fontSize: "13px",
            color: "var(--text-main)",
          }}
        >
          {post.author.name}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          @{post.author.username}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          ·
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {post.createdAt}
        </span>
      </div>

      {/* Nội dung bài gốc */}
      {post.content && (
        <div
          style={{
            fontSize: "14px",
            color: "var(--text-main)",
            lineHeight: "1.45",
            marginBottom: imageUrl ? "8px" : "0",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {renderFormattedContent(post.content)}
        </div>
      )}

      {/* Hình ảnh đính kèm bài gốc (nếu có) */}
      {imageUrl && (
        <div
          style={{
            marginTop: "6px",
            borderRadius: "10px",
            overflow: "hidden",
            maxHeight: "240px",
          }}
        >
          <img
            src={imageUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "240px",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default QuoteSpool;
