import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { ThreadPost, Author, ThreadReply } from "@/types";
import {
  SortIcon,
  ExpandIcon,
  ImageIcon,
  GifIcon,
  RepostIcon,
  HeartIcon,
  CommentIcon,
  ShareIcon,
  MoreDotsIcon,
} from "./Icons";
import { tweetsApi } from "@/apis/tweets.api";
import { useFormatRelativeTime } from "@/hooks/useFormatRelativeTime";
import SpoolsSlider from "./SpoolCard/SpoolsSlider";
import ActionSpool from "./SpoolCard/ActionSpool";
import VideoSpool from "./SpoolCard/VideoSpool";
import ContentSpool, { renderFormattedContent } from "./SpoolCard/ContentSpool";
import OptionsSpool from "./SpoolCard/OptionsSpool";
import AvatarSpool from "./SpoolCard/AvatarSpool";
import InforSpool from "./SpoolCard/InforSpool";
import FileSpool from "./SpoolCard/FileSpool";
import QuoteSpool from "./SpoolCard/QuoteSpool";
import { useQuery } from "@tanstack/react-query";

interface ThreadCardProps {
  post: ThreadPost;
  currentUser: Author;
  onLikeToggle?: (postId: string) => void;
  onRepostToggle?: (postId: string) => void;
  onReplyAdded?: (postId: string, text: string) => void;
  onShare: (post: ThreadPost) => void;
  onDelete: (id: string) => void;
  onBookmark: (post: ThreadPost) => void;
  onArchived?: (post: ThreadPost) => void | undefined;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({
  post,
  currentUser,
  onLikeToggle,
  onRepostToggle,
  onReplyAdded,
  onShare,
  onDelete,
  onBookmark,
  onArchived,
}) => {
  const navigate = useNavigate();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [pollData, setPollData] = useState(post.poll);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const [likedReplies, setLikedReplies] = useState<
    Record<string, { isLiked: boolean; count: number }>
  >({});
  const [showAllReplies, setShowAllReplies] = useState(true);

  const handleReplyToUser = (username: string) => {
    setReplyText(`@${username} `);
    replyInputRef.current?.focus();
  };

  const handleToggleReplyLike = (
    replyId: string,
    initialCount: number,
    initialIsLiked: boolean,
  ) => {
    setLikedReplies((prev) => {
      const current = prev[replyId] ?? {
        isLiked: initialIsLiked,
        count: initialCount,
      };
      const nextIsLiked = !current.isLiked;
      return {
        ...prev,
        [replyId]: {
          isLiked: nextIsLiked,
          count: Math.max(0, current.count + (nextIsLiked ? 1 : -1)),
        },
      };
    });
  };

  const { data: repliesData, isLoading: isLoadingReplies } = useQuery({
    queryKey: ["tweet_children", post.id],
    queryFn: () => tweetsApi.getTweetChildren(post.id),
    enabled: showReplyBox && Boolean(post.id) && !post.id.startsWith("thread-"),
    staleTime: 60 * 1000, // Cache 1 phút
  });

  // Chuẩn hóa dữ liệu trả về từ TanStack Query (hỗ trợ cả AxiosResponse và Array)
  const rawChildren = (repliesData as any)?.data?.data;
  const fetchedReplies: ThreadReply[] = Array.isArray(rawChildren)
    ? rawChildren.map((t: any) => ({
        id: t._id || t.id,
        author: {
          id: t.user?._id || t.user?.id,
          name: t.user?.name || "Anonymous",
          username: t.user?.username || "user",
          avatar:
            t.user?.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          verified: true,
        },
        content: t.content,
        createdAt: t.createdAt
          ? useFormatRelativeTime(t.createdAt)
          : "Just now",
        likes: t.likesCount ?? t.like ?? 0,
        isLiked: t.isLiked ?? false,
      }))
    : Array.isArray(repliesData)
      ? (repliesData as ThreadReply[])
      : [];

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
    onReplyAdded?.(post.id, replyText.trim());
    setReplyText("");
  };

  // Hợp nhất replies truyền từ props và replies fetch từ server
  const allReplies: ThreadReply[] = [
    ...(post.replies || []),
    ...fetchedReplies.filter(
      (f) => !(post.replies || []).some((r) => r.id === f.id),
    ),
  ];
  const hasReplies = allReplies.length > 0;

  // Extract all media types (supporting both post.medias array and post.media object)
  const imageUrls: string[] = Array.from(
    new Set([
      ...(post.media?.type === "image" || post.media?.type === "carousel"
        ? post.media.urls
        : []),
      ...(post.medias
        ?.filter((m) => m.type === "image")
        .flatMap((m) => m.urls) || []),
    ]),
  );
  const allVideoItems = [
    ...(post.media?.type === "video" || post.media?.type === "hls"
      ? [{ type: post.media.type, urls: post.media.urls }]
      : []),
    ...(post.medias
      ?.filter((m) => m.type === "video" || m.type === "hls")
      .map((m) => ({ type: m.type, urls: m.urls })) || []),
  ];
  const seenVideoUrls = new Set<string>();
  const videoItems = allVideoItems.filter((vid) => {
    const key = vid.urls?.[0];
    if (!key || seenVideoUrls.has(key)) return false;
    seenVideoUrls.add(key);
    return true;
  });

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
      {post.repostedBy && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            fontWeight: "500",
            color: "var(--text-secondary)",
            marginBottom: "8px",
            paddingLeft: "54px",
          }}
          className="repost-header"
        >
          <RepostIcon size={14} active={true} />
          <span>{post.repostedBy.name} đã đăng lại</span>
        </div>
      )}

      {/* Main Tweet: Clean 2-column Flexbox layout */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        {/* Left Column: Avatar */}
        <div style={{ flexShrink: 0, width: "42px" }}>
          <AvatarSpool post={post} />
        </div>

        {/* Right Column: Header, Content, Medias, Poll, Quotes, Actions */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header (Username, time & Options) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <InforSpool post={post} />
            <OptionsSpool
              post={post}
              onShare={onShare}
              onDelete={(id) => {
                onDelete(id);
              }}
              onArchived={onArchived}
            />
          </div>
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
          {/* Hiển thị bài viết được trích dẫn (Quote Post) */}
          {post.quotedPost && <QuoteSpool post={post.quotedPost} />}

          <ActionSpool
            onLikeToggle={onLikeToggle}
            post={post}
            onRepostToggle={onRepostToggle}
            onShare={onShare}
            onBookmark={onBookmark}
            isReposted={post.isReposted}
            onCommentClick={() => setShowReplyBox((prev) => !prev)}
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
              {post.repostsCount > 0 && (
                <>
                  <span>·</span>
                  <span>{post.repostsCount.toLocaleString()} reposts</span>
                </>
              )}
              {/* Thêm số lượt quotes nếu có */}
              {(post.quotesCount ?? 0) > 0 && (
                <>
                  <span>·</span>
                  <span>{post.quotesCount?.toLocaleString()} quotes</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Discussion / Comments Section (Direct child of article, spanning full card) */}
      {showReplyBox && (
        <div
          style={{
            marginTop: "14px",
            marginLeft: "-20px",
            marginRight: "-20px",
            borderTop: "1px solid var(--border-color)",
          }}
          className="thread-discussion-section animate-fade-in"
        >
          {/* Sort row: ↓↑ Top ˇ & View activity > */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px 8px 20px",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <SortIcon size={14} />
              <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                Top
              </span>
              <span style={{ fontSize: "10px", transform: "translateY(1px)" }}>
                ▼
              </span>
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>View activity</span>
              <span>›</span>
            </div>
          </div>

          {/* Pill Reply Composer */}
          <div style={{ padding: "0 20px 14px 20px" }}>
            <form
              onSubmit={handleReplySubmit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "9999px",
                padding: "8px 14px",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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
                  flexShrink: 0,
                }}
              />
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${post.author.username}...`}
                autoFocus
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  color: "var(--text-main)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleReplySubmit(e);
                  }
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{ cursor: "pointer", display: "flex" }}
                  title="Image"
                >
                  <ImageIcon size={18} />
                </span>
                <span
                  style={{ cursor: "pointer", display: "flex" }}
                  title="GIF"
                >
                  <GifIcon size={18} />
                </span>
                <span
                  style={{ cursor: "pointer", display: "flex" }}
                  title="Expand"
                >
                  <ExpandIcon size={16} />
                </span>
                {replyText.trim() && (
                  <button
                    type="submit"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-blue, #1d9bf0)",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: "0 4px",
                    }}
                  >
                    Post
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Full-width Divider between composer and replies */}
          <div style={{ borderTop: "1px solid var(--border-color)" }} />

          {/* Loading replies */}
          {isLoadingReplies && (
            <div
              style={{
                padding: "16px 20px",
                fontSize: "13px",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>Đang tải bình luận...</span>
            </div>
          )}

          {/* Nested Replies Rendering (Connected by Threads Thread Line) */}
          {hasReplies && (
            <div
              style={{
                padding: "12px 20px 6px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {(showAllReplies ? allReplies : allReplies.slice(0, 1)).map(
                (reply, rIdx, arr) => {
                  const isPostAuthor =
                    reply.author.username === post.author.username;
                  const isNested = rIdx > 0;
                  const likeState = likedReplies[reply.id] ?? {
                    isLiked: reply.isLiked ?? false,
                    count: reply.likes ?? 0,
                  };
                  const hasNextReply = rIdx < arr.length - 1;

                  return (
                    <div
                      key={reply.id}
                      style={{
                        display: "flex",
                        gap: "12px",
                        position: "relative",
                        paddingLeft: isNested ? "24px" : "0",
                      }}
                    >
                      {/* Thread connector line for nested replies */}
                      {isNested && (
                        <div
                          style={{
                            position: "absolute",
                            left: "6px",
                            top: "-8px",
                            width: "16px",
                            height: "22px",
                            borderLeft: "2px solid var(--border-color)",
                            borderBottom: "2px solid var(--border-color)",
                            borderBottomLeftRadius: "10px",
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Vertical connector line running down from avatar */}
                      {hasNextReply && (
                        <div
                          style={{
                            position: "absolute",
                            left: isNested ? "22px" : "17px",
                            top: isNested ? "32px" : "38px",
                            bottom: "-14px",
                            width: "2px",
                            backgroundColor: "var(--border-color)",
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Avatar */}
                      <img
                        src={reply.author.avatar}
                        alt={reply.author.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (reply.author.username) {
                            navigate(`/@${reply.author.username}`);
                          }
                        }}
                        style={{
                          width: isNested ? "30px" : "36px",
                          height: isNested ? "30px" : "36px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                          zIndex: 1,
                          cursor: "pointer",
                        }}
                      />

                      {/* Content Column */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header: Username, Time, Author tag & Options */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "2px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (reply.author.username) {
                                  navigate(`/@${reply.author.username}`);
                                }
                              }}
                              style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                color: "var(--text-main)",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.textDecoration =
                                  "underline")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.textDecoration = "none")
                              }
                            >
                              {reply.author.username}
                            </span>
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
                                  fontWeight: "500",
                                }}
                              >
                                Author
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              padding: "2px",
                            }}
                            title="Options"
                          >
                            <MoreDotsIcon size={16} />
                          </div>
                        </div>

                        {/* Comment text with link rendering & Translate */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                            lineHeight: "1.45",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {renderFormattedContent(reply.content)}
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-block",
                              marginTop: "2px",
                            }}
                          >
                            Translate
                          </span>
                        </div>

                        {/* Action buttons row (Heart, Comment, Repost, Share) */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
                            marginTop: "8px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {/* Heart */}
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleReplyLike(
                                reply.id,
                                reply.likes,
                                reply.isLiked ?? false,
                              )
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              color: likeState.isLiked
                                ? "var(--accent-red, #ff3040)"
                                : "inherit",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: "13px",
                              transition: "transform 0.15s ease",
                            }}
                            className={likeState.isLiked ? "animate-pop" : ""}
                          >
                            <HeartIcon size={16} active={likeState.isLiked} />
                            {likeState.count > 0 && (
                              <span>{likeState.count}</span>
                            )}
                          </button>

                          {/* Comment (reply shortcut) */}
                          <button
                            type="button"
                            onClick={() =>
                              handleReplyToUser(reply.author.username)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              color: "inherit",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: "13px",
                            }}
                          >
                            <CommentIcon size={16} />
                            <span>1</span>
                          </button>

                          {/* Repost */}
                          <button
                            type="button"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              color: "inherit",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: "13px",
                            }}
                          >
                            <RepostIcon size={16} />
                          </button>

                          {/* Share */}
                          <button
                            type="button"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              color: "inherit",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: "13px",
                            }}
                          >
                            <ShareIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}

              {/* Show replies toggle at the bottom */}
              {allReplies.length > 1 && (
                <div
                  onClick={() => setShowAllReplies((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    paddingLeft: "42px",
                    paddingTop: "4px",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>
                    {showAllReplies ? "↑" : "↓"}
                  </span>
                  <span>
                    {showAllReplies
                      ? "Hide replies"
                      : `Show ${allReplies.length - 1} replies`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
