import React, { useState } from "react";
import type { Author } from "@/types";
import { SearchIcon, VerifiedBadge } from "./Icons";
import { useNavigate } from "react-router-dom";

interface RightSidebarProps {
  suggestions: Author[];
  onFollowToggle: (authorId: string) => void;
  onSearch: (query: string) => void;
  googleAuthUrl?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  suggestions,
  onFollowToggle,
  onSearch,
  googleAuthUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const trendingTopics = [
    { tag: "#ArtificialIntelligence", count: "142K spools" },
    { tag: "#FullstackDevelopment", count: "89K spools" },
    { tag: "#SpoolApp", count: "64K spools" },
    { tag: "#React19", count: "38K spools" },
    { tag: "#WebDesign", count: "27K spools" },
  ];

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: "340px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        position: "sticky",
        top: "84px",
        alignSelf: "flex-start",
      }}
    >
      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          position: "relative",
          backgroundColor: "var(--bg-card)",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          padding: "10px 14px",
          gap: "10px",
        }}
      >
        <span style={{ color: "var(--text-secondary)" }}>
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search Spool or profiles..."
          style={{
            flex: 1,
            fontSize: "14px",
            color: "var(--text-main)",
          }}
        />
      </form>

      {/* Suggested Follows Card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid var(--border-color)",
        }}
      >
        <h4
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-main)",
            marginBottom: "14px",
          }}
        >
          Suggested for you
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {suggestions.map((user) => (
            <div
              key={user.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: 0,
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        fontSize: "14px",
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.username}
                    </span>
                    {user.verified && <VerifiedBadge size={13} />}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.followers} followers
                  </div>
                </div>
              </div>

              <button
                onClick={() => onFollowToggle(user.id)}
                style={{
                  backgroundColor: user.isFollowing
                    ? "transparent"
                    : "var(--accent-white)",
                  color: user.isFollowing
                    ? "var(--text-secondary)"
                    : "var(--bg-main)",
                  border: user.isFollowing
                    ? "1px solid var(--border-color)"
                    : "none",
                  padding: "5px 14px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                {user.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid var(--border-color)",
        }}
      >
        <h4
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-main)",
            marginBottom: "14px",
          }}
        >
          Trending topics
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {trendingTopics.map((topic, i) => (
            <div
              key={i}
              onClick={() => onSearch(topic.tag)}
              style={{
                cursor: "pointer",
                padding: "4px 0",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                }}
              >
                {topic.tag}
              </span>
              <span
                style={{ fontSize: "12px", color: "var(--text-secondary)" }}
              >
                {topic.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Account / Auth Box */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text-main)",
          }}
        >
          Account & Connect
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              flex: 1,
              backgroundColor: "var(--bg-pill)",
              padding: "8px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-main)",
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              flex: 1,
              backgroundColor: "var(--bg-pill)",
              padding: "8px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-main)",
            }}
          >
            Register
          </button>
        </div>

        {googleAuthUrl && (
          <a
            href={googleAuthUrl}
            style={{
              width: "100%",
              backgroundColor: "var(--bg-pill-hover)",
              padding: "8px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-main)",
              textAlign: "center",
              display: "block",
              marginTop: "4px",
            }}
          >
            Sign in with Google
          </a>
        )}
      </div>

      {/* Footer Links */}
      <footer
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "0 4px",
        }}
      >
        <a href="#terms">Terms</a>
        <span>·</span>
        <a href="#privacy">Privacy Policy</a>
        <span>·</span>
        <a href="#cookies">Cookies</a>
        <span>·</span>
        <a href="#about">About</a>
        <div style={{ width: "100%", marginTop: "4px" }}>© 2026 Spool</div>
      </footer>
    </aside>
  );
};
