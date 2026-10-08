import {
  CalendarAfterIcon,
  CalendarBeforeIcon,
  FilterIcon,
  SearchIcon,
  UserIcon,
  VerifiedBadge,
} from "@/components/Icons";
import TopBar from "@/components/TopBar";
import { INITIAL_SUGGESTIONS } from "@/mockData";
import { COLUMN_LABELS } from "@/types/column.types";
import React, { useEffect, useRef, useState } from "react";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const suggestions = INITIAL_SUGGESTIONS;
  //Click outside to close popup
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
  return (
    <>
      <div className="feed-column">
        <TopBar type="search" />
        <section className="feed-section">
          <div style={{ padding: "24px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "var(--bg-input)",
                padding: "12px 16px",
                borderRadius: "14px",
                marginBottom: "24px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <SearchIcon size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accounts, topics and keywords..."
                autoFocus
                style={{ flex: 1, fontSize: "15px" }}
              />
              <div className="filter-options-wrapper" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsOpen((prev) => !prev)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    transition: "color 0.15s ease",
                  }}
                  title="Filter search"
                >
                  <FilterIcon size={20} />
                </button>

                {isOpen && (
                  <>
                    <div className="filter-dropdown-menu">
                      <button className="filter-dropdown-item">
                        <span>Trước ngày</span>
                        <CalendarBeforeIcon size={18} />
                      </button>
                      <button className="filter-dropdown-item">
                        <span>Sau ngày</span>
                        <CalendarAfterIcon size={18} />
                      </button>
                      <hr
                        style={{
                          border: "1px solid var(--border-color)",
                          margin: "8px 0",
                        }}
                      />
                      <button className="filter-dropdown-item">
                        <span>Từ trang cá nhân</span>
                        <UserIcon size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                marginBottom: "14px",
                color: "var(--text-secondary)",
              }}
            >
              Suggested people
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <img
                      src={s.avatar}
                      alt={s.name}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span style={{ fontWeight: "700", fontSize: "15px" }}>
                          {s.username}
                        </span>
                        {s.verified && <VerifiedBadge size={14} />}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {s.name} · {s.followers} followers
                      </div>
                    </div>
                  </div>
                  <button
                    // onClick={() => handleFollowToggle(s.id)}
                    style={{
                      backgroundColor: s.isFollowing
                        ? "transparent"
                        : "var(--accent-white)",
                      color: s.isFollowing
                        ? "var(--text-secondary)"
                        : "var(--bg-main)",
                      border: s.isFollowing
                        ? "1px solid var(--border-color)"
                        : "none",
                      padding: "6px 18px",
                      borderRadius: "9999px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {s.isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SearchPage;
