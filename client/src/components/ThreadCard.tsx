import React, { useState } from "react";
import type { ThreadPost, Author } from "@/types";
import { SortIcon, ExpandIcon, ImageIcon, GifIcon } from "./Icons";
import SpoolsSlider from "./SpoolCard/SpoolsSlider";
import ActionSpool from "./SpoolCard/ActionSpool";
import VideoSpool from "./SpoolCard/VideoSpool";
import ContentSpool from "./SpoolCard/ContentSpool";
import OptionsSpool from "./SpoolCard/OptionsSpool";
import AvatarSpool from "./SpoolCard/AvatarSpool";
import InforSpool from "./SpoolCard/InforSpool";
import FileSpool from "./SpoolCard/FileSpool";

interface ThreadCardProps {
  post: ThreadPost;
  currentUser: Author;
  onLikeToggle: (postId: string) => void;
  onRepostToggle: (postId: string) => void;
  onReplyAdded: (postId: string, text: string) => void;
  onShare: (post: ThreadPost) => void;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({
  post,
  currentUser,
  onLikeToggle,
  onRepostToggle,
  onReplyAdded,
  onShare,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [pollData, setPollData] = useState(post.poll);
  // Initialize HLS if media type is HLS or Video

  const handleVote = (index: number) => {
    if (!pollData || pollData.userVotedIndex !== undefined) return;
    const updatedOptions = pollData.options.map((opt, i) =>
      i === index ? { ...opt, votes: opt.votes + 1 } : opt,
    );
    setPollData({
      ...pollData,
      options: updatedOptions,
      totalVotes: pollData.totalVotes + 1,
      userVotedIndex: index,
    });
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplyAdded(post.id, replyText.trim());
    setReplyText("");
    setShowReplyBox(false);
  };

  const hasReplies = post.replies && post.replies.length > 0;

  // Extract all media types (supporting both post.medias array and post.media object)
  const imageUrls: string[] = [
    ...(post.media?.type === "image" || post.media?.type === "carousel"
      ? post.media.urls
      : []),
    ...(post.medias?.filter((m) => m.type === "image").flatMap((m) => m.urls) ||
      []),
  ];

  const videoItems = [
    ...(post.media?.type === "video" || post.media?.type === "hls"
      ? [{ type: post.media.type, urls: post.media.urls }]
      : []),
    ...(post.medias
      ?.filter((m) => m.type === "video" || m.type === "hls")
      .map((m) => ({ type: m.type, urls: m.urls })) || []),
  ];

  const fileItems = [
    ...(post.media?.type === "file"
      ? post.media.urls.map((url, i) => ({
          name: `Document_${i + 1}.pdf`,
          size: "1.5 MB",
          url,
        }))
      : []),
    ...(post.medias
      ?.filter((m) => m.type === "file")
      .flatMap((m) =>
        m.urls.map((url, i) => ({
          name: m.name || url.split("/").pop() || `Document_${i + 1}.pdf`,
          size: m.size || "1.5 MB",
          url,
        })),
      ) || []),
  ];

  return (
    <article
      style={{
        padding: "16px 20px",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
        position: "relative",
      }}
      className="thread-card animate-fade-in"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px minmax(0, 1fr)",
        }}
      >
        <div
          style={{
            gridRowEnd: "span 2",
          }}
        >
          <AvatarSpool post={post} />
        </div>

        <div
          style={{
            gridRowEnd: "1/2",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <InforSpool post={post} />
          <OptionsSpool post={post} onShare={onShare} />
        </div>

        {/* Content, Media, Poll, Actions Column */}
        <div
          style={{
            gridColumn: "2",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <ContentSpool post={post} />
          {/* Attached Media: Image(s) / Carousel */}
          {imageUrls.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <SpoolsSlider
                images={imageUrls}
                aspectRatio={post.media?.aspectRatio}
              />
            </div>
          )}

          {/* Attached Media: Video / HLS Stream(s) */}
          {videoItems.map((vid, vIdx) => (
            <VideoSpool key={vIdx} post={{ ...post, media: vid }} />
          ))}

          {/* Attached Media: File(s) */}
          {fileItems.map((file, fIdx) => (
            <FileSpool key={fIdx} file={file} />
          ))}
          {/* Attached Media: Poll */}
          {pollData && (
            <div
              style={{
                marginBottom: "12px",
                backgroundColor: "var(--bg-input)",
                borderRadius: "14px",
                padding: "12px 14px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {pollData.options.map((option, idx) => {
                  const percent =
                    pollData.totalVotes > 0
                      ? Math.round((option.votes / pollData.totalVotes) * 100)
                      : 0;
                  const isUserChoice = pollData.userVotedIndex === idx;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleVote(idx)}
                      disabled={pollData.userVotedIndex !== undefined}
                      style={{
                        position: "relative",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: isUserChoice
                          ? "1px solid var(--accent-white)"
                          : "1px solid var(--border-color)",
                        backgroundColor: "var(--bg-card)",
                        overflow: "hidden",
                        textAlign: "left",
                        cursor:
                          pollData.userVotedIndex !== undefined
                            ? "default"
                            : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Animated vote percentage bar */}
                      {pollData.userVotedIndex !== undefined && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${percent}%`,
                            backgroundColor: "var(--bg-pill-hover)",
                            opacity: 0.6,
                            zIndex: 0,
                            transition: "width 0.4s ease",
                          }}
                        />
                      )}

                      <span
                        style={{
                          position: "relative",
                          zIndex: 1,
                          fontSize: "14px",
                          fontWeight: isUserChoice ? "600" : "400",
                        }}
                      >
                        {option.text} {isUserChoice && "✓"}
                      </span>

                      {pollData.userVotedIndex !== undefined && (
                        <span
                          style={{
                            position: "relative",
                            zIndex: 1,
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {percent}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                {pollData.totalVotes.toLocaleString()} votes ·{" "}
                {pollData.userVotedIndex !== undefined
                  ? "Final results"
                  : "Tap to vote"}
              </div>
            </div>
          )}

          <ActionSpool
            onLikeToggle={onLikeToggle}
            post={post}
            onRepostToggle={onRepostToggle}
            onShare={onShare}
          />

          {/* Counts & Activity footer */}
          {!post.createdAt.includes("left") && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "10px",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <span>{post.repliesCount} replies</span>
              <span>·</span>
              <span>{post.likes.toLocaleString()} likes</span>
            </div>
          )}

          {/* Dedicated Screenshot Sort Bar & Reply Composer */}
          {post.id === "thread-0" && (
            <div
              style={{
                margin: "14px -20px 0",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              {/* Sort row: ↓↑ Top ˇ */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "12px 20px 8px",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <SortIcon size={14} />
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                  Top
                </span>
                <span style={{ fontSize: "10px" }}>▼</span>
              </div>

              {/* Reply bar container with Image, GIF, Expand icons */}
              <div style={{ padding: "0 20px 14px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "9999px",
                    padding: "8px 14px",
                  }}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${post.author.username}...`}
                    style={{
                      flex: 1,
                      fontSize: "14px",
                      color: "var(--text-main)",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleReplySubmit(e);
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span style={{ cursor: "pointer" }} title="Image">
                      <ImageIcon size={18} />
                    </span>
                    <span style={{ cursor: "pointer" }} title="GIF">
                      <GifIcon size={18} />
                    </span>
                    <span style={{ cursor: "pointer" }} title="Expand">
                      <ExpandIcon size={16} />
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)" }} />
            </div>
          )}

          {/* Inline Reply input for standard posts */}
          {post.id !== "thread-0" && showReplyBox && (
            <form
              onSubmit={handleReplySubmit}
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${post.author.username}...`}
                autoFocus
                style={{
                  flex: 1,
                  backgroundColor: "var(--bg-input)",
                  padding: "8px 14px",
                  borderRadius: "9999px",
                  fontSize: "14px",
                  color: "var(--text-main)",
                  border: "1px solid var(--border-color)",
                }}
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                style={{
                  backgroundColor: replyText.trim()
                    ? "var(--accent-white)"
                    : "var(--bg-pill)",
                  color: replyText.trim()
                    ? "var(--bg-main)"
                    : "var(--text-secondary)",
                  padding: "6px 16px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: replyText.trim() ? "pointer" : "default",
                }}
              >
                Reply
              </button>
            </form>
          )}
        </div>

        {/* Nested Replies Rendering (Connected by Thread line) */}
        {hasReplies && (
          <div
            style={{
              marginTop: "16px",
              paddingLeft: "56px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {post.replies!.map((reply, rIdx) => {
              const isPostAuthor =
                reply.author.username === post.author.username;
              return (
                <div
                  key={reply.id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    paddingTop: "8px",
                    borderTop:
                      rIdx === 0 && post.id !== "thread-0"
                        ? "1px solid var(--border-subtle)"
                        : "none",
                  }}
                >
                  <img
                    src={reply.author.avatar}
                    alt={reply.author.name}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
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
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "var(--text-main)",
                        }}
                      >
                        {reply.author.username}
                      </span>
                      {reply.topic && (
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "13px",
                          }}
                        >
                          &gt;{" "}
                          <span
                            style={{
                              color: "var(--text-main)",
                              fontWeight: "500",
                            }}
                          >
                            {reply.topic}
                          </span>
                        </span>
                      )}
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "13px",
                        }}
                      >
                        {reply.createdAt}
                      </span>
                      {isPostAuthor && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            backgroundColor: "var(--bg-pill)",
                            padding: "1px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          Author
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "var(--text-main)",
                        marginTop: "4px",
                        lineHeight: "1.45",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {reply.content.split("\n").map((line, lIdx) => (
                        <div key={lIdx}>
                          {line.split(" ").map((word, wIdx) => {
                            if (
                              word.startsWith("http") ||
                              word.includes(".com") ||
                              word.includes(".vn")
                            ) {
                              return (
                                <span
                                  key={wIdx}
                                  style={{
                                    color: "var(--accent-blue)",
                                    textDecoration: "underline",
                                  }}
                                >
                                  {word}{" "}
                                </span>
                              );
                            }
                            return word + " ";
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Reply Media 3-image grid if present */}
                    {/* {reply.media?.urls && reply.media.urls.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(reply.media.urls.length, 3)}, 1fr)`,
                        gap: "6px",
                        marginTop: "10px",
                        borderRadius: "14px",
                        overflow: "hidden",
                      }}
                    >
                      {reply.media.urls.map((url, uIdx) => (
                        <img
                          key={uIdx}
                          src={url}
                          alt="Reply attachment"
                          style={{
                            width: "100%",
                            height: "240px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "1px solid var(--border-color)",
                          }}
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )} */}
                    {/* <ActionSpool /> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
};
