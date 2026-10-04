import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AddColumnIcon, MoreHorizontalIcon, RemoveColumnIcon } from "./Icons";
import { useApp } from "@/contexts/AppContext";

const pageTitles: Record<string, string> = {
  "/": "For you",
  "/following": "Following",
  "/messages": "Messages",
  "/notifications": "Notifications",
  "/search": "Search",
  "/settings": "Settings",
  "/profile": "Profile",
  "/liked": "Liked",
  "/saved": "Saved",
};

const TopBar = () => {
  const location = useLocation();
  const { showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeTitle = pageTitles[location.pathname] || "For you";

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAddColumn = () => {
    showToast("Đã thêm cột mới");
    setIsOpen(false);
  };

  const handleRemoveColumn = () => {
    showToast("Đã gỡ cột");
    setIsOpen(false);
  };

  return (
    <div
      className="thread-header-bar"
      style={{
        position: "sticky",
      }}
    >
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "var(--text-main)",
          margin: 0,
        }}
      >
        {activeTitle}
      </h2>

      <div className="topbar-options-wrapper" ref={menuRef}>
        <button
          className="topbar-more-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          title="Options"
          aria-label="Options"
          aria-expanded={isOpen}
        >
          <MoreHorizontalIcon size={16} />
        </button>

        {isOpen && (
          <div className="topbar-dropdown-menu">
            <button className="topbar-dropdown-item" onClick={handleAddColumn}>
              <span>Thêm cột</span>
              <AddColumnIcon />
            </button>
            <button
              className="topbar-dropdown-item"
              onClick={handleRemoveColumn}
            >
              <span>Gỡ cột</span>
              <RemoveColumnIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
