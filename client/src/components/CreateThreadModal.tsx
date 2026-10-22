import React, { useRef, useState, useMemo, useEffect } from "react";
import Hls from "hls.js";
import type { Author } from "@/types";
import {
  ChevronRightIcon,
  ImageIcon,
  VideoIcon,
  GhostIcon,
  CloseIcon,
} from "./Icons";
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
import { notifications } from "@/apis/notifications.api";
import SpoolsSlider from "./SpoolCard/SpoolsSlider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";

// Ngưỡng thời lượng (giây): >= 60s dùng HLS cho video dài, < 60s dùng direct upload cho video ngắn
const HLS_DURATION_THRESHOLD_SECONDS = 60;

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration || 0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(0);
    };
    video.src = objectUrl;
  });
};

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
  const [mentionQuery, setMentionQuery] = useState<string | null>(null); // query @mention
  const [topicTag, setTopicTag] = useState(""); // query #hashtag
  const [cursorPosition, setCursorPosition] = useState<number>(0); // cursor position
  const [isGhost, setIsGhost] = useState(false); // Ghost post toggle (tự xoá sau 24h)

  // Apply theme to document
  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["tweets"] });
    showToast("Đã đăng bài!");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setQuoteTarget(null); // Reset bài viết quote khi đóng
    setIsGhost(false);
    setVideoUrls([]);
  };

  // ---- upload image
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // TanStack Mutation: Upload image
  const uploadImageMutation = useMutation({
    mutationFn: (formData: FormData) => mediasApi.uploadImage(formData),
    onSuccess: (res) => {
      if (res?.data?.url && res.data.url.length > 0) {
        setImageUrls((prev) => [...prev, ...res.data.url]);
        showToast("Image uploaded successfully");
      }
    },
    onError: (error) => {
      console.error(error);
      showToast("Tải ảnh thất bại, vui lòng thử lại");
    },
  });
  const isUploadingImage = uploadImageMutation.isPending;

  // ---- upload video
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  // TanStack Mutation: Upload video hls (video dài >= 60s)
  const uploadVideoHlsMutation = useMutation({
    mutationFn: (formData: FormData) => mediasApi.uploadVideoHls(formData),
    onSuccess: (res) => {
      const urls = res?.data?.url || (res?.data as any)?.result;
      if (Array.isArray(urls) && urls.length > 0) {
        setVideoUrls((prev) => [...prev, ...urls]);
        showToast("Tải video HLS thành công!");
      } else if (typeof urls === "string") {
        setVideoUrls((prev) => [...prev, urls]);
        showToast("Tải video HLS thành công!");
      }
    },
    onError: (error) => {
      console.error(error);
      showToast("Tải video HLS thất bại, vui lòng thử lại");
    },
  });
  const isUploadingVideoHls = uploadVideoHlsMutation.isPending;

  // TanStack Mutation: Upload video thường (video ngắn < 60s)
  const uploadVideoMutation = useMutation({
    mutationFn: (formData: FormData) => mediasApi.uploadVideo(formData),
    onSuccess: (res) => {
      const urls = res?.data?.url || (res?.data as any)?.result;
      if (Array.isArray(urls) && urls.length > 0) {
        setVideoUrls((prev) => [...prev, ...urls]);
        showToast("Tải video lên thành công!");
      } else if (typeof urls === "string") {
        setVideoUrls((prev) => [...prev, urls]);
        showToast("Tải video lên thành công!");
      }
    },
    onError: (error) => {
      console.error(error);
      showToast("Tải video thất bại, vui lòng thử lại");
    },
  });
  const isUploadingVideo = uploadVideoMutation.isPending;
  const isUploadingAnyVideo = isUploadingVideo || isUploadingVideoHls;
  const isUploading = isUploadingImage || isUploadingAnyVideo;

  // HLS stream attach cho preview video player
  useEffect(() => {
    const video = previewVideoRef.current;
    const url = videoUrls[0];
    if (!video || !url) return;

    const isHls = url.includes(".m3u8") || url.includes("/video-hls/");
    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      }
    } else {
      video.src = url;
    }
  }, [videoUrls]);

  // TanStack Query: Autocomplete tìm profile theo @mention
  const debouncedMention = useDebounce(mentionQuery || "", 400);
  const { data: mentionUserRes } = useQuery({
    queryKey: ["mention_search", debouncedMention],
    queryFn: () => usersApi.getProfile(debouncedMention),
    enabled: Boolean(debouncedMention && debouncedMention.trim().length > 0),
    staleTime: 1000 * 60,
  });

  const searchUser: Author[] = useMemo(() => {
    const user = mentionUserRes?.data?.data;
    if (!user) return [];
    return [
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
    ];
  }, [mentionUserRes]);

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<CreateTweetFormValues>({
      resolver: zodResolver(createTweetSchema),
      defaultValues: {
        content: "",
        imageUrl: "",
      },
    });

  const content = watch("content") || "";

  // TanStack Mutation: Tạo bài viết mới hoặc Quote tweet
  const createTweetMutation = useMutation({
    mutationFn: async (
      payload: Parameters<typeof tweetsApi.createTweet>[0],
    ) => {
      const response = await tweetsApi.createTweet(payload);

      // Nếu là trích dẫn bài viết của người khác -> gửi thông báo
      if (
        payload.type === TweetType.QUOTETWEET &&
        quoteTarget?.author?.id &&
        quoteTarget.author.id !== profile?._id
      ) {
        notifications
          .createNotification({
            senderId: profile?._id || "",
            receiverId: quoteTarget.author.id,
            type: "quote",
            tweetId: quoteTarget.id,
            content: payload.content || "",
          })
          .catch(console.error);
      }

      return response;
    },
    onSuccess: (_response, variables) => {
      const isQuoting = variables.type === TweetType.QUOTETWEET;
      showToast(
        isQuoting ? "Đã trích dẫn bài viết!" : "Post created successfully",
      );

      handlePostCreated();
      reset();
      setImageUrls([]);
      setVideoUrls([]);
      handleCloseModal();

      // Làm mới dữ liệu trên feeds và profile
      queryClient.invalidateQueries({ queryKey: ["feeds_post"] });
      queryClient.invalidateQueries({ queryKey: ["user_posts"] });
      queryClient.invalidateQueries({ queryKey: ["ghost_posts"] });
      setIsGhost(false);
    },
    onError: (error) => {
      console.error(error);
      showToast("Failed to create post");
    },
  });
  const isPosting = createTweetMutation.isPending;

  if (!isModalOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    uploadImageMutation.mutate(formData, {
      onSettled: () => {
        if (e.target) e.target.value = "";
      },
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((e.target.files as FileList) || []);
    if (files.length === 0) return;

    if (videoUrls.length + files.length > 1) {
      showToast("Mỗi bài viết chỉ được tải lên tối đa 1 video");
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("video/")) {
      showToast("Vui lòng chọn định dạng video hợp lệ (MP4, WebM, MOV)");
      return;
    }

    // Giới hạn video 100MB
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast("Dung lượng video không được vượt quá 100MB");
      return;
    }

    const duration = await getVideoDuration(file);
    const formData = new FormData();
    formData.append("video", file);

    const isLongVideo = duration >= HLS_DURATION_THRESHOLD_SECONDS;
    const mutation = isLongVideo ? uploadVideoHlsMutation : uploadVideoMutation;

    mutation.mutate(formData, {
      onSettled: () => {
        if (e.target) e.target.value = "";
      },
    });
  };

  const handleRemoveVideo = (index: number) => {
    setVideoUrls((prev) => prev.filter((_, i) => i !== index));
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

  const onSubmit = (data: CreateTweetFormValues) => {
    // Chuẩn hóa topicTag: bỏ dấu # nếu có, lấy tối đa 1 hashtag dạng string
    const hashtag = topicTag.trim().replace(/^#/, "");
    const medias = [
      ...imageUrls.map((url) => ({
        url,
        type: MediaType.IMAGE,
      })),
      ...videoUrls.map((url) => ({
        url,
        type:
          url.includes(".m3u8") || url.includes("/video-hls/")
            ? MediaType.HLS
            : MediaType.VIDEO,
      })),
    ];

    const isQuoting = Boolean(quoteTarget);
    createTweetMutation.mutate({
      content: data.content.trim(),
      type: isQuoting ? TweetType.QUOTETWEET : TweetType.TWEET,
      audience: TweetAudienceType.EVERYONE,
      parentId: isQuoting ? quoteTarget!.id : null,
      hashtags: hashtag ? [hashtag] : [],
      mentions: [],
      medias,
      isGhost: isGhost,
    });
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
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleVideoUpload}
                  style={{
                    display: "none",
                  }}
                />

                {/* loading upload image */}
                {isUploadingImage && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid var(--accent-blue, #0095f6)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <span>Đang tải ảnh lên...</span>
                  </div>
                )}

                {/* loading upload video */}
                {isUploadingAnyVideo && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      marginBottom: "10px",
                      color: "var(--accent-blue, #0095f6)",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid currentColor",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      {isUploadingVideoHls
                        ? "Đang tải và xử lý video dài (HLS)... Vui lòng không đóng cửa sổ."
                        : "Đang tải video lên server... Vui lòng không đóng cửa sổ."}
                    </span>
                  </div>
                )}

                {/* Preview danh sách ảnh */}
                {imageUrls.length > 0 && !isUploadingImage && (
                  <SpoolsSlider
                    images={imageUrls}
                    handleRemoveImage={handleRemoveImage}
                  />
                )}

                {/* Preview video đính kèm */}
                {videoUrls.length > 0 && !isUploadingAnyVideo && (
                  <div
                    style={{
                      marginBottom: "12px",
                      position: "relative",
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "#000",
                    }}
                  >
                    <video
                      ref={previewVideoRef}
                      controls
                      playsInline
                      preload="metadata"
                      style={{
                        width: "100%",
                        maxHeight: "340px",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(0)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "#fff",
                        borderRadius: "50%",
                        padding: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        cursor: "pointer",
                        backdropFilter: "blur(4px)",
                        transition: "transform 0.15s ease",
                        zIndex: 10,
                      }}
                      title="Xóa video"
                    >
                      <CloseIcon size={14} />
                    </button>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        backdropFilter: "blur(6px)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        pointerEvents: "none",
                      }}
                    >
                      <VideoIcon size={12} />
                      <span>
                        {videoUrls[0]?.includes(".m3u8") ||
                        videoUrls[0]?.includes("/video-hls/")
                          ? "Video HLS (Adaptive Bitrate) sẵn sàng đăng"
                          : "Video MP4 sẵn sàng đăng"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Icons & Ghost Post Checkbox */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "var(--text-secondary)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  {/* Image upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{
                      cursor: isUploading ? "not-allowed" : "pointer",
                      color:
                        imageUrls.length > 0
                          ? "var(--accent-blue, #0095f6)"
                          : "var(--text-secondary)",
                      padding: "4px",
                      background: "none",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.15s ease",
                    }}
                    title="Đính kèm ảnh"
                  >
                    <ImageIcon size={20} />
                  </button>

                  {/* Video upload button */}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploading}
                    style={{
                      cursor: isUploading ? "not-allowed" : "pointer",
                      color:
                        videoUrls.length > 0
                          ? "var(--accent-blue, #0095f6)"
                          : "var(--text-secondary)",
                      padding: "4px",
                      background: "none",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.15s ease",
                    }}
                    title="Đính kèm video"
                  >
                    <VideoIcon size={20} />
                  </button>
                </div>

                {/* Ghost Post Checkbox Button */}
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    border: isGhost
                      ? "1px solid rgba(168, 85, 247, 0.45)"
                      : "1px solid var(--border-color)",
                    backgroundColor: isGhost
                      ? "rgba(168, 85, 247, 0.12)"
                      : "transparent",
                    color: isGhost ? "#c084fc" : "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: isGhost ? "600" : "400",
                    transition: "all 0.15s ease",
                    userSelect: "none",
                  }}
                  title="Ghost Post: Bài viết sẽ tự động xóa sau 24h và chỉ hiển thị ở tab Ghost"
                >
                  <input
                    type="checkbox"
                    checked={isGhost}
                    onChange={(e) => setIsGhost(e.target.checked)}
                    style={{
                      cursor: "pointer",
                      accentColor: "#a855f7",
                      width: "14px",
                      height: "14px",
                      margin: 0,
                      display: "none",
                    }}
                  />
                  <GhostIcon size={16} />
                  <span>Ghost post</span>
                </label>
              </div>

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
                gap: "6px",
              }}
            >
              <span>Anyone can reply & quote</span>
              {isGhost && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#c084fc",
                    fontWeight: "500",
                    fontSize: "12px",
                  }}
                >
                  • 👻 Tự huỷ sau 24h
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={
                (!content.trim() && !imageUrls.length && !videoUrls.length) ||
                isPosting ||
                isUploading
              }
              style={{
                backgroundColor:
                  content.trim() || imageUrls.length || videoUrls.length
                    ? "var(--accent-white)"
                    : "var(--bg-pill)",
                color:
                  content.trim() || imageUrls.length || videoUrls.length
                    ? "var(--bg-main)"
                    : "var(--text-secondary)",
                fontWeight: "600",
                padding: "8px 24px",
                borderRadius: "9999px",
                fontSize: "15px",
                cursor:
                  (content.trim() || imageUrls.length || videoUrls.length) &&
                  !isUploading
                    ? "pointer"
                    : "default",
                transition: "all 0.15s ease",
              }}
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
