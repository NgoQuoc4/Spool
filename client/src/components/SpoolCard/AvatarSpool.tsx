import type { ThreadPost } from "@/types";

const AvatarSpool = ({ post }: { post: ThreadPost }) => {
  return (
    <>
      <img
        src={post.author.avatar}
        alt={post.author.name}
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />

      {/* {hasReplies && (
            <div
              style={{
                width: "2px",
                flexGrow: 1,
                backgroundColor: "var(--thread-line)",
                margin: "6px 0",
                borderRadius: "1px",
              }}
            />
          )} */}

      {/* Mini Reply Avatars at bottom of line */}
      {/* {hasReplies && post.replyAvatars && post.replyAvatars.length > 0 && (
            <div
              style={{
                position: "relative",
                width: "28px",
                height: "28px",
                marginTop: "2px",
              }}
            >
              <img
                src={post.replyAvatars[0]}
                alt="Reply avatar"
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  border: "2px solid var(--bg-card)",
                  objectFit: "cover",
                }}
              />
              {post.replyAvatars[1] && (
                <img
                  src={post.replyAvatars[1]}
                  alt="Reply avatar"
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    border: "2px solid var(--bg-card)",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          )} */}
    </>
  );
};

export default AvatarSpool;
