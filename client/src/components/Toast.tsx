import React from "react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "32px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "var(--accent-white)",
        color: "var(--bg-main)",
        padding: "10px 20px",
        borderRadius: "9999px",
        fontSize: "14px",
        fontWeight: "600",
        zIndex: 9999,
        boxShadow: "var(--shadow-popup)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <span>✓</span>
      <span>{message}</span>
    </div>
  );
};
