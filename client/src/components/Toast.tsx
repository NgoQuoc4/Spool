import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  const [currentMessage, setCurrentMessage] = useState<string | null>(message);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setIsExiting(false);
    } else if (currentMessage) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setCurrentMessage(null);
        setIsExiting(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!currentMessage) return null;

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
        pointerEvents: "none",
        animation: isExiting
          ? "toastOut 0.2s ease-in forwards"
          : "toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <span>✓</span>
      <span>{currentMessage}</span>
    </div>
  );
};
