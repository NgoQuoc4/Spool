import React from "react";
import { ImageIcon, GifIcon, PollIcon, MicIcon } from "./Icons";
import type { Author } from "@/types";

interface QuickComposerProps {
  currentUser: Author;
  onOpenModal: () => void;
}

export const QuickComposer: React.FC<QuickComposerProps> = ({
  currentUser,
  onOpenModal,
}) => {
  return (
    <div
      onClick={onOpenModal}
      style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "16px",
        border: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-card)";
        e.currentTarget.style.borderColor = "var(--border-color)";
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "16px",
            height: "16px",
            backgroundColor: "var(--accent-white)",
            color: "var(--bg-main)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "bold",
            border: "2px solid var(--bg-card)",
          }}
        >
          +
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <span style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          What's new on Spool?
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "var(--text-secondary)",
        }}
      >
        <span title="Thêm ảnh">
          <ImageIcon size={18} />
        </span>
        <span title="Thêm GIF">
          <GifIcon size={18} />
        </span>
        <span title="Thêm bình chọn">
          <PollIcon size={18} />
        </span>
        <span title="Ghi âm">
          <MicIcon size={18} />
        </span>
      </div>

      <button
        style={{
          backgroundColor: "var(--bg-pill)",
          color: "var(--text-secondary)",
          padding: "6px 16px",
          borderRadius: "9999px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Post
      </button>
    </div>
  );
};
