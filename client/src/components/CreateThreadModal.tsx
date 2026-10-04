import React, { useState } from "react";
import type { Author, ThreadPost } from "@/types";
import { CloseIcon, GifIcon, ImageIcon, TagIcon } from "./Icons";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Author;
  onPostCreated: (post: ThreadPost) => void;
}

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPostCreated,
}) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim()) return;

    setIsSubmitting(true);

    const newPost: ThreadPost = {
      id: `user-thread-${Date.now()}`,
      author: currentUser,
      content: content.trim(),
      createdAt: "Just now",
      media: imageUrl.trim()
        ? {
            type: "image",
            urls: [imageUrl.trim()],
          }
        : undefined,
      likes: 0,
      repliesCount: 0,
      repostsCount: 0,
      isLiked: false,
    };

    setTimeout(() => {
      onPostCreated(newPost);
      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  const handleQuickImageAdd = (sampleUrl: string) => {
    setImageUrl(sampleUrl);
    setShowImageInput(true);
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
        if (e.target === e.currentTarget) onClose();
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
            onClick={onClose}
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
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
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
                src={currentUser.avatar}
                alt={currentUser.name}
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
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontWeight: "600",
                  fontSize: "15px",
                  color: "var(--text-main)",
                }}
              >
                {currentUser.username}
              </span>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start a spool..."
                rows={4}
                autoFocus
                style={{
                  width: "100%",
                  resize: "none",
                  fontSize: "15px",
                  lineHeight: "1.45",
                  color: "var(--text-main)",
                  minHeight: "80px",
                }}
              />

              {/* Image Input field */}
              {showImageInput && (
                <div style={{ marginBottom: "8px" }}>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL (https://...)"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--bg-input)",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      fontSize: "13px",
                      color: "var(--text-main)",
                    }}
                  />
                  {imageUrl && (
                    <div
                      style={{
                        position: "relative",
                        marginTop: "8px",
                        maxWidth: "300px",
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: "180px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          border: "1px solid var(--border-color)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          color: "#fff",
                          borderRadius: "50%",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Icons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  style={{
                    color: showImageInput
                      ? "var(--text-main)"
                      : "var(--text-secondary)",
                    padding: "4px",
                  }}
                  title="Attach Image"
                >
                  <ImageIcon size={20} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickImageAdd(
                      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                    )
                  }
                  style={{ color: "var(--text-secondary)", padding: "4px" }}
                  title="Demo tech image"
                >
                  <GifIcon size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + " #spool #webdev")}
                  style={{ color: "var(--text-secondary)", padding: "4px" }}
                  title="Add Tag"
                >
                  <TagIcon size={20} />
                </button>
              </div>

              {/* Add to spool prompt */}
              <div
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
              </div>
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
              disabled={(!content.trim() && !imageUrl.trim()) || isSubmitting}
              style={{
                backgroundColor:
                  content.trim() || imageUrl.trim()
                    ? "var(--accent-white)"
                    : "var(--bg-pill)",
                color:
                  content.trim() || imageUrl.trim()
                    ? "var(--bg-main)"
                    : "var(--text-secondary)",
                fontWeight: "600",
                padding: "8px 24px",
                borderRadius: "9999px",
                fontSize: "15px",
                cursor:
                  content.trim() || imageUrl.trim() ? "pointer" : "default",
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
