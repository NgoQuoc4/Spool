import type { ThreadPost } from "@/types";

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
          {post.content}
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
          }}
        >
          {post.content.split(" ").map((word: string, i: number) => {
            if (word.startsWith("#") || word.startsWith("@")) {
              return (
                <span
                  key={i}
                  style={{ color: "var(--accent-blue)", fontWeight: "500" }}
                >
                  {word}{" "}
                </span>
              );
            }
            return word + " ";
          })}
        </div>
      )}
    </>
  );
};

export default ContentSpool;
