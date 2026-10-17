import React, { useEffect, useRef, useState } from "react";
import type { Author } from "@/types";
import { ChevronRightIcon, ImageIcon } from "./Icons";
import { tweetsApi } from "@/apis/tweets.api";
import { TweetAudienceType, TweetType, MediaType } from "@/types/tweet.types";
import { useAppStore } from "@/stores/useAppStore";
import {
  createTweetSchema,
  type CreateTweetFormValues,
} from "@/schemas/tweet.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@/apis/users.api";
import { useAuth } from "@/contexts/AuthContext";
import { mediasApi } from "@/apis/medias.api";
import SpoolsSlider from "./SpoolCard/SpoolsSlider";
import { useQueryClient } from "@tanstack/react-query";

export const CreateThreadModal = () => {
  const {
    showToast,
    isModalOpen,
    quoteTarget,
    setQuoteTarget,
    setIsModalOpen,
  } = useAppStore();

  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [searchUser, setSearchUser] = useState<Author[]>([]); // @mention suggestions
  const [mentionQuery, setMentionQuery] = useState<string | null>(null); // query @mention
  const [topicTag, setTopicTag] = useState(""); // query #hashtag
  const [cursorPosition, setCursorPosition] = useState<number>(0); // cursor position

  // Apply theme to document
  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["tweets"] });
    showToast("Đã đăng bài!");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setQuoteTarget(null); // Reset bài viết quote khi đóng
  };

  // ---- upload image
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  // ---- upload image

  useEffect(() => {
    if (!mentionQuery || mentionQuery.trim() === "") {
      setSearchUser([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await usersApi.getProfile(mentionQuery);
        if (res?.data?.data) {
          const user = res.data.data;
          setSearchUser([
            {
              id: user._id,
              name: user.name,
              username: user.username,
              avatar:
                user.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
              isFollowing: false,
              followersCount: user.followersCount,
              followingCount: user.followingCount,
            },
          ]);
        }
      } catch {
        setSearchUser([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [mentionQuery]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateTweetFormValues>({
    resolver: zodResolver(createTweetSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
    },
  });

  const content = watch("content") || "";
  const imageUrl = watch("imageUrl") || [];

  if (!isModalOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((e.target.files as FileList) || []);
    if (files.length === 0) return;

    if (imageUrls.length + files.length > 6) {
      showToast("Chỉ được tải lên tối đa 6 ảnh");
      return;
    }

    // check file size
    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        showToast("File size must be less than 4MB");
        return;
      }
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("image", file);
    });

    try {
      setIsUploading(true);
      const res = await mediasApi.uploadImage(formData);
      console.log("🚀 ~ handleImageUpload ~ res:", res);
      if (res?.data?.url && res.data.url.length > 0) {
        setImageUrls((prev) => [...prev, ...res.data.url]);
        showToast("Image uploaded successfully");
      }
    } catch (error) {
      console.error(error);
      showToast("Tải ảnh thất bại, vui lòng thử lại");
    } finally {
      setIsUploading(false);
      // Reset input để có thể chọn lại cùng 1 file nếu cần
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const renderHighlightedContent = (content: string) => {
    if (!content) return null;
    // Bắt cả @mention và #hashtag đứng sau khoảng trắng hoặc đầu dòng
    const parts = content.split(/(?<=\s|^)([@#][\w.]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@") || part.startsWith("#")) {
        return (
          <span
            key={index}
            style={{
              color: "var(--accent-blue, #0095f6)",
              fontWeight: "500",
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart || 0;
    setCursorPosition(cursor);
    const textBeforeCursor = value.slice(0, cursor);
    const match = textBeforeCursor.match(/(?<=\s|^)@([\w.]*)$/);
    if (match) {
      setMentionQuery(match[1].toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectUser = (selectedUsername: string) => {
    if (mentionQuery === null) return;
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    const newTextBefore = textBeforeCursor.replace(
      /(?<=\s|^)@[\w.]*$/,
      `@${selectedUsername} `,
    );
    const newContent = newTextBefore + textAfterCursor;
    setValue("content", newContent);
    setMentionQuery(null);
  };

  const onSubmit = async (data: CreateTweetFormValues) => {
    try {
      // Chuẩn hóa topicTag: bỏ dấu # nếu có, lấy tối đa 1 hashtag dạng string
      const hashtag = topicTag.trim().replace(/^#/, "");
      const medias = imageUrls.map((url) => ({
        url,
        type: MediaType.IMAGE,
      }));

      const isQuoting = Boolean(quoteTarget);
      const response = await tweetsApi.createTweet({
        content: data.content.trim(),
        type: isQuoting ? TweetType.QUOTETWEET : TweetType.TWEET,
        audience: TweetAudienceType.EVERYONE,
        parentId: isQuoting ? quoteTarget!.id : null,
        hashtags: hashtag ? [hashtag] : [],
        mentions: [],
        medias,
      });

      if (response.status === 200 || response.status === 201) {
        showToast(
          isQuoting ? "Đã trích dẫn bài viết!" : "Post created successfully",
        );

        handlePostCreated();
        reset();
        setImageUrls([]);
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to create post");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div
        className="animate-modal"
        style={{
          width: "100%",
          maxWidth: "620px",
          backgroundColor: "var(--bg-modal)",
          borderRadius: "20px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-popup)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <button
            type="button"
            onClick={handleCloseModal}
            style={{
              color: "var(--text-secondary)",
              fontSize: "15px",
              fontWeight: "500",
              padding: "4px",
            }}
          >
            Cancel
          </button>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "var(--text-main)",
              margin: 0,
            }}
          >
            New spool
          </h3>
          <div style={{ width: "48px" }} />
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "20px" }}>
          <div style={{ display: "flex", gap: "14px" }}>
            {/* Left: Avatar + Connector Thread line */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={
                  profile?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                }
                alt={profile?.name || "avatar"}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  width: "2px",
                  flexGrow: 1,
                  backgroundColor: "var(--thread-line)",
                  margin: "8px 0",
                  borderRadius: "1px",
                  minHeight: "40px",
                }}
              />
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "var(--thread-line)",
                  opacity: 0.6,
                }}
              />
            </div>

            {/* Right: Username & Textarea */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "15px",
                    color: "var(--text-main)",
                  }}
                >
                  {profile?.username}
                </span>

                <ChevronRightIcon />

                {/* Input nhập Hashtags/Topic */}
                <input
                  type="text"
                  value={topicTag}
                  onChange={(e) => setTopicTag(e.target.value)}
                  placeholder="#hashtag"
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: topicTag
                      ? "var(--accent-blue, #0095f6)"
                      : "var(--text-muted, #777)",
                    fontSize: "14px",
                    fontWeight: topicTag ? "500" : "400",
                    padding: "2px 4px",
                    borderRadius: "6px",
                    width: "200px",
                  }}
                />
              </div>
              {/* Editor 2 lớp: Backdrop highlight + Textarea trong suốt */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: "80px",
                }}
              >
                {/* Lớp 1: Nằm dưới, hiển thị màu xanh cho @mention và màu trắng cho chữ thường */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    fontSize: "15px",
                    lineHeight: "1.45",
                    fontFamily: "inherit",
                    padding: 0,
                    margin: 0,
                    color: "var(--text-main)",
                    zIndex: 1,
                    overflow: "hidden",
                  }}
                >
                  {renderHighlightedContent(content)}
                </div>

                {/* Lớp 2: Textarea thật để gõ, chữ trong suốt để lộ lớp dưới */}
                <textarea
                  {...register("content")}
                  onChange={(e) => {
                    register("content").onChange(e); // Gọi để react-hook-form cập nhật
                    handleTextareaChange(e);
                  }}
                  onKeyUp={(e) => {
                    // Cập nhật vị trí con trỏ khi bấm phím mũi tên
                    const target = e.target as HTMLTextAreaElement;
                    const textBefore = target.value.slice(
                      0,
                      target.selectionStart,
                    );
                    const match = textBefore.match(/(?<=\s|^)@([\w.]*)$/);
                    setMentionQuery(match ? match[1].toLowerCase() : null);
                  }}
                  placeholder={content ? "" : "Start a spool..."}
                  rows={4}
                  autoFocus
                  style={{
                    position: "relative",
                    width: "100%",
                    resize: "none",
                    fontSize: "15px",
                    lineHeight: "1.45",
                    fontFamily: "inherit",
                    padding: 0,
                    margin: 0,
                    minHeight: "80px",
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    color: "transparent",
                    caretColor: "var(--text-main)",
                    zIndex: 2,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                />

                {/* Dropdown Gợi ý User khi gõ @ */}
                {mentionQuery !== null && searchUser.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      backgroundColor: "var(--bg-modal, #181818)",
                      border: "1px solid var(--border-color, #333)",
                      borderRadius: "14px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      overflow: "hidden",
                      marginTop: "6px",
                    }}
                  >
                    {searchUser.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user.username)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "var(--text-main)",
                            }}
                          >
                            {user.name}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--accent-blue, #0095f6)",
                            }}
                          >
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Input field */}
              <div style={{ marginBottom: "8px" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{
                    display: "none",
                  }}
                />
                {/* loading upload image  */}
                {isUploading && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                    }}
                  >
                    Đang tải ảnh lên...
                  </div>
                )}
                {/* preview image when upload image */}
                {/* Preview danh sách ảnh */}
                {imageUrls.length > 0 && !isUploading && (
                  <SpoolsSlider
                    images={imageUrls}
                    handleRemoveImage={handleRemoveImage}
                  />
                )}
              </div>

              {/* Action Icons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                {/* Image upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    cursor: isUploading ? "not-allowed" : "pointer",
                    color: imageUrl
                      ? "var(--accent-blue, #0095f6)"
                      : "var(--text-secondary)",
                    padding: "4px",
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Attach Image"
                >
                  <ImageIcon size={20} />
                </button>

                {/* <button
                  type="button"
                  onClick={() => {
                    setValue(
                      "imageUrl",
                      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                    );
                    // setShowImageInput(true);
                  }}
                  style={{ color: "var(--text-secondary)", padding: "4px" }}
                  title="Demo tech image"
                >
                  <GifIcon size={20} />
                </button> */}
                {/* <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "content",
                      (content ? content + " " : "") + "#spool #webdev",
                    )
                  }
                  style={{ color: "var(--text-secondary)", padding: "4px" }}
                  title="Add Tag"
                >
                  <TagIcon size={20} />
                </button> */}
              </div>
              {quoteTarget && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-card)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <img
                      src={quoteTarget.author.avatar}
                      alt=""
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
                      {quoteTarget.author.name}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      @{quoteTarget.author.username}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-main)",
                      margin: 0,
                      lineClamp: 2,
                    }}
                  >
                    {quoteTarget.content}
                  </p>
                </div>
              )}
              {/* Add to spool prompt */}
              {/* <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Add to spool</span>
              </div> */}
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Anyone can reply & quote</span>
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !imageUrls.length) || isSubmitting}
              style={{
                backgroundColor:
                  content.trim() || imageUrls.length
                    ? "var(--accent-white)"
                    : "var(--bg-pill)",
                color:
                  content.trim() || imageUrls.length
                    ? "var(--bg-main)"
                    : "var(--text-secondary)",
                fontWeight: "600",
                padding: "8px 24px",
                borderRadius: "9999px",
                fontSize: "15px",
                cursor:
                  content.trim() || imageUrls.length ? "pointer" : "default",
                transition: "all 0.15s ease",
              }}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
