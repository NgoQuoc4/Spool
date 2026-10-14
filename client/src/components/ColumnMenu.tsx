import React, { useState, useRef, useEffect } from "react";
import { AddColumnIcon, ChevronRightIcon, ChevronLeftIcon } from "./Icons";
import { useAppStore, type ColumnType } from "@/stores/useAppStore";

interface ColumnMenuProps {
  onToggleTwoColumns?: (enabled: boolean) => void;
  onSelectOption?: (optionKey: string) => void;
}

type MenuItemType = {
  key: string;
  label: string;
  type?: ColumnType["type"];
};

const MENUS: MenuItemType[] = [
  { key: "search", label: "Tìm kiếm", type: "search" },
  { key: "activity", label: "Hoạt động", type: "activity" },
  { key: "insights", label: "Insights", type: "insights" },
  { key: "profile", label: "Profile", type: "profile" },
  { key: "other_feeds", label: "Feeds khác", type: "other_feeds" },
];

const OTHER_FEEDS: MenuItemType[] = [
  { key: "following", label: "Following", type: "follow" },
  { key: "for_you", label: "For you", type: "like" },
  { key: "messages", label: "Messages", type: "message" },
  { key: "archive", label: "Archive", type: "archive" },
  { key: "liked", label: "Liked", type: "like" },
  { key: "saved", label: "Saved", type: "save" },
  { key: "ghost", label: "Ghost", type: "ghost" },
];

export const ColumnMenu: React.FC<ColumnMenuProps> = ({ onSelectOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"main" | "other_feeds">(
    "main",
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast, columns, addColumn, setIsModalOpen } = useAppStore();
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setCurrentView("main");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (
    key: string,
    label: string,
    type?: ColumnType["type"],
  ) => {
    if (onSelectOption) {
      onSelectOption(key);
    }
    if (!type) {
      setIsOpen(false);
      setCurrentView("main");
      return;
    }
    if (columns.some((column) => column.type === type)) {
      showToast(`Đã chọn: ${label}`);
    } else {
      addColumn({
        type,
        label,
      });
      setIsModalOpen(false);
    }
    setIsOpen(false);
    setCurrentView("main");
  };

  const menuItemStyle: React.CSSProperties = {
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
          {currentView === "main" ? (
            <>
              {/* Header Row: Hiển thị 2 cột + Toggle Switch */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 6px 8px 6px",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "var(--text-main)",
                  }}
                >
                  Thêm cột
                </span>
              </div>

              {/* Đường phân cách */}
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--border-color)",
                  margin: "6px 0 10px 0",
                }}
              />

              {/* Danh sách hành động */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                {MENUS.map((menu) => {
                  if (menu.key === "other_feeds") {
                    return (
                      <button
                        key={menu.key}
                        onClick={() => setCurrentView("other_feeds")}
                        className="column-menu-item"
                        style={{
                          ...menuItemStyle,
                          justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--bg-card-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <span>Bảng feed khác</span>
                        <ChevronRightIcon size={16} />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={menu.key}
                      onClick={() =>
                        handleItemClick(menu.key, menu.label, menu.type)
                      }
                      className="column-menu-item"
                      style={menuItemStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--bg-card-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {menu.label}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Header Submenu with Back button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 6px 8px 6px",
                }}
              >
                <button
                  onClick={() => setCurrentView("main")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-main)",
                    borderRadius: "6px",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--bg-card-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  aria-label="Quay lại"
                >
                  <ChevronLeftIcon size={18} />
                </button>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "var(--text-main)",
                  }}
                >
                  Bảng feed khác
                </span>
              </div>

              {/* Đường phân cách */}
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--border-color)",
                  margin: "6px 0 10px 0",
                }}
              />

              {/* Danh sách các feed khác */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                {OTHER_FEEDS.map((menu) => {
                  return (
                    <button
                      key={menu.key}
                      onClick={() =>
                        handleItemClick(menu.key, menu.label, menu.type)
                      }
                      className="column-menu-item"
                      style={menuItemStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--bg-card-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {menu.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ColumnMenu;
