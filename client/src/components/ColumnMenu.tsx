import React, { useState, useRef, useEffect } from "react";
import { AddColumnIcon, ChevronRightIcon } from "./Icons";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

interface ColumnMenuProps {
  onToggleTwoColumns?: (enabled: boolean) => void;
  onSelectOption?: (optionKey: string) => void;
}

export const ColumnMenu: React.FC<ColumnMenuProps> = ({
  onToggleTwoColumns,
  onSelectOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTwoColumns, setIsTwoColumns] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useApp();
  const navigate = useNavigate();

  // Click outside to close
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

  const handleToggleSwitch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isTwoColumns;
    setIsTwoColumns(nextState);
    if (onToggleTwoColumns) {
      onToggleTwoColumns(nextState);
    }
    showToast(nextState ? "Đã bật chế độ 2 cột" : "Đã tắt chế độ 2 cột");
  };

  const handleItemClick = (key: string, label: string, path?: string) => {
    if (onSelectOption) {
      onSelectOption(key);
    }
    if (path) {
      navigate(path);
    } else {
      showToast(`Đã chọn: ${label}`);
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={menuRef}
      className="column-menu-wrapper"
      style={{
        position: "sticky",
        top: "50vh",
        alignSelf: "flex-start",
        marginLeft: "12px",
        transform: "translateY(-50%)",
        zIndex: 60,
      }}
    >
      {/* Nút biểu tượng thêm cột */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          border: `1px solid ${isOpen ? "var(--text-secondary)" : "var(--border-color)"}`,
          backgroundColor: "var(--bg-main)",
          color: isOpen ? "var(--text-main)" : "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-main)";
          e.currentTarget.style.borderColor = "var(--text-secondary)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border-color)";
          }
        }}
        title="Tuỳ chọn cột"
        aria-label="Tuỳ chọn cột"
        aria-expanded={isOpen}
      >
        <AddColumnIcon size={16} />
      </button>

      {/* Popup menu hiển thị như ảnh */}
      {isOpen && (
        <div
          className="column-menu-popup"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "240px",
            backgroundColor: "var(--bg-modal)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            boxShadow: "var(--shadow-popup)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "14px 12px 10px 12px",
            zIndex: 100,
            animation: "columnMenuFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
            userSelect: "none",
          }}
        >
          {/* Header Row: Hiển thị 2 cột + Toggle Switch */}
          <div
            onClick={handleToggleSwitch}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 6px 8px 6px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-main)",
              }}
            >
              Hiển thị 2 cột
            </span>

            {/* Toggle switch iOS/Threads style */}
            <div
              style={{
                width: "42px",
                height: "24px",
                borderRadius: "12px",
                backgroundColor: isTwoColumns
                  ? "var(--text-main)"
                  : "var(--bg-input)",
                border: `1.5px solid ${isTwoColumns ? "var(--text-main)" : "var(--border-color)"}`,
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: "2px",
                transition:
                  "background-color 0.2s ease, border-color 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: isTwoColumns
                    ? "var(--bg-main)"
                    : "var(--text-secondary)",
                  transform: isTwoColumns
                    ? "translateX(18px)"
                    : "translateX(0px)",
                  transition:
                    "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease",
                }}
              />
            </div>
          </div>

          {/* Đường phân cách */}
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--border-color)",
              margin: "6px 0 10px 0",
            }}
          />

          {/* Section Header: Thêm cột */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              padding: "0 6px 6px 6px",
            }}
          >
            Thêm cột
          </div>

          {/* Danh sách hành động */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <button
              onClick={() => handleItemClick("search", "Tìm kiếm", "/search")}
              className="column-menu-item"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 8px",
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-main)",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Tìm kiếm
            </button>

            <button
              onClick={() =>
                handleItemClick("activity", "Hoạt động", "/notifications")
              }
              className="column-menu-item"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 8px",
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-main)",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Hoạt động
            </button>

            <button
              onClick={() =>
                handleItemClick("profile", "Trang cá nhân", "/profile")
              }
              className="column-menu-item"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 8px",
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-main)",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Trang cá nhân
            </button>

            <button
              onClick={() => handleItemClick("insights", "Thông tin chi tiết")}
              className="column-menu-item"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 8px",
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-main)",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Thông tin chi tiết
            </button>

            <button
              onClick={() => handleItemClick("other_feeds", "Bảng feed khác")}
              className="column-menu-item"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 8px",
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-main)",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <span>Bảng feed khác</span>
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnMenu;
