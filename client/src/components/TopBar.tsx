import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AddColumnIcon, MoreHorizontalIcon, RemoveColumnIcon } from "./Icons";
import { useAppStore } from "@/stores/useAppStore";
import { COLUMN_LABELS, type ColumnKey } from "@/types/column.types";

interface TopBarProps {
  type?: ColumnKey;
  columnId?: string;
  title?: string;
}
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

const TopBar = ({ type, columnId, title }: TopBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast, removeColumn, addColumn, columns } = useAppStore();

  // Hiển thị tiêu đề chính xác theo title / type của cột (khi nhúng trong đa cột), fallback theo pathname
  const activeTitle =
    title ||
    (type && type !== "home" && COLUMN_LABELS[type]) ||
    pageTitles[location.pathname] ||
    "For you";

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
    if (!type || type === "home") return;
    const isExist = columns.some((col) => col.type === type);
    if (isExist) {
      showToast("Cột này đã tồn tại");
      return;
    }
    showToast(`Đã thêm cột "${COLUMN_LABELS[type] || type}"`);
    addColumn({
      type: type,
      label: COLUMN_LABELS[type] || type,
    });
    setIsOpen(false);

    // Nếu đang ở trang khác, chuyển về trang Home để thấy ngay cột vừa thêm
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleRemoveColumn = () => {
    const target = columnId || type;
    if (!target) return;
    removeColumn(target);
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

      {/* Ẩn menu cho cột trang chủ chính (cột cố định) */}
      {type !== "home" && (
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
              {columns.some((column) => column.type === type) ? (
                <button
                  className="topbar-dropdown-item"
                  onClick={handleRemoveColumn}
                >
                  <span>Gỡ cột</span>
                  <RemoveColumnIcon />
                </button>
              ) : (
                <button
                  className="topbar-dropdown-item"
                  onClick={handleAddColumn}
                >
                  <span>Thêm cột</span>
                  <AddColumnIcon />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopBar;
