import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  SpoolLogo,
  HomeIcon,
  SearchIcon,
  HeartIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  MenuBarsIcon,
  MessageIcon,
  InsightIcon,
  BookmarkIcon,
  GhostIcon,
  ArchiveIcon,
  UsersIcon,
  PlusIcon,
} from "./Icons";
import type { Author } from "../types";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCreateModal: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  currentUser?: Author;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openCreateModal,
  theme,
  toggleTheme,
  unreadCount = 3,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const navItemStyle = (tabKey: string) => ({
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: activeTab === tabKey ? ("700" as const) : ("500" as const),
    color: activeTab === tabKey ? "var(--text-main)" : "var(--text-secondary)",
    backgroundColor: activeTab === tabKey ? "var(--bg-pill)" : "transparent",
    width: "100%",
    textAlign: "left" as const,
    transition: "all 0.15s ease",
    cursor: "pointer",
  });

  return (
    <>
      {/* ================= DESKTOP LEFT NAVIGATION RAIL ================= */}
      <aside
        className="threads-left-rail"
        style={{
          width: "240px",
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "18px 16px 20px 20px",
          borderRight: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-main)",
          zIndex: 90,
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Top Brand Header: Logo + Staggered Menu "=" button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              padding: "0 6px",
              position: "relative",
            }}
            ref={menuRef}
          >
            <button
              onClick={() => setActiveTab("forYou")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 0",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              title="Spool Home"
            >
              <SpoolLogo size={32} />
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  color: "var(--text-main)",
                }}
              >
                spool
              </span>
            </button>

            {/* Menu Button "=" */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                padding: "6px 8px",
                borderRadius: "8px",
                color: isMenuOpen
                  ? "var(--text-main)"
                  : "var(--text-secondary)",
                backgroundColor: isMenuOpen ? "var(--bg-pill)" : "transparent",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-main)")
              }
              onMouseLeave={(e) => {
                if (!isMenuOpen)
                  e.currentTarget.style.color = "var(--text-secondary)";
              }}
              title="Menu"
            >
              <MenuBarsIcon size={22} />
            </button>

            {/* Flyout Menu Dropdown */}
            {isMenuOpen && (
              <div
                className="animate-modal"
                style={{
                  position: "absolute",
                  top: "42px",
                  left: 0,
                  width: "240px",
                  backgroundColor: "var(--bg-modal)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-popup)",
                  padding: "6px",
                  zIndex: 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <button
                  onClick={toggleTheme}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    color: "var(--text-main)",
                    fontSize: "14px",
                    fontWeight: "600",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--bg-pill)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Appearance</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "var(--text-secondary)",
                      fontSize: "13px",
                    }}
                  >
                    <span>{theme === "dark" ? "Dark" : "Light"}</span>
                    {theme === "dark" ? (
                      <MoonIcon size={16} />
                    ) : (
                      <SunIcon size={16} />
                    )}
                  </div>
                </button>

                <NavLink
                  to="/setting"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab("setting");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    color: "var(--text-main)",
                    fontSize: "14px",
                    fontWeight: "600",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--bg-pill)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Settings
                </NavLink>

                <NavLink
                  to="/report"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    color: "var(--text-main)",
                    fontSize: "14px",
                    fontWeight: "600",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--bg-pill)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Report a problem
                </NavLink>

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--border-subtle)",
                    margin: "4px 0",
                  }}
                />

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      color: "var(--text-main)",
                      fontSize: "14px",
                      fontWeight: "600",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--bg-pill)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/login");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        color: "var(--text-main)",
                        fontSize: "14px",
                        fontWeight: "600",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--bg-pill)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      Log in
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/register");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        color: "var(--text-main)",
                        fontSize: "14px",
                        fontWeight: "600",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--bg-pill)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      Create account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/*======================= Primary Navigation Items=========================== */}
          <NavLink
            to="/"
            onClick={() => {
              setActiveTab("forYou");
            }}
            style={navItemStyle("forYou")}
            onMouseEnter={(e) => {
              if (activeTab !== "forYou")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "forYou")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <HomeIcon size={22} active={activeTab === "forYou"} />
            <span>For you</span>
          </NavLink>

          <button
            onClick={openCreateModal}
            style={navItemStyle("create")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-pill)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <PlusIcon size={22} />
            <span>New thread</span>
          </button>

          <NavLink
            to="/search"
            onClick={() => {
              setActiveTab("search");
            }}
            style={navItemStyle("search")}
            onMouseEnter={(e) => {
              if (activeTab !== "search")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "search")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <SearchIcon size={21} active={activeTab === "search"} />
            <span>Search</span>
          </NavLink>

          <NavLink
            to="/messages"
            onClick={() => {
              setActiveTab("messages");
            }}
            style={navItemStyle("messages")}
            onMouseEnter={(e) => {
              if (activeTab !== "messages")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "messages")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <MessageIcon size={21} />
            <span>Messages</span>
          </NavLink>

          <NavLink
            to="/activity"
            onClick={() => {
              setActiveTab("activity");
            }}
            style={{ ...navItemStyle("activity"), position: "relative" }}
            onMouseEnter={(e) => {
              if (activeTab !== "activity")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "activity")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <HeartIcon size={21} active={activeTab === "activity"} />
            <span>Activity</span>
            {unreadCount > 0 && activeTab !== "activity" && (
              <span
                style={{
                  position: "absolute",
                  left: "26px",
                  top: "11px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--like-color)",
                }}
              />
            )}
          </NavLink>

          <NavLink
            to="/profile"
            onClick={() => {
              setActiveTab("profile");
            }}
            style={navItemStyle("profile")}
            onMouseEnter={(e) => {
              if (activeTab !== "profile")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "profile")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <UserIcon size={21} active={activeTab === "profile"} />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/insights"
            onClick={() => {
              setActiveTab("insights");
            }}
            style={navItemStyle("insights")}
            onMouseEnter={(e) => {
              if (activeTab !== "insights")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "insights")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <InsightIcon size={21} />
            <span>Insights</span>
          </NavLink>
          {/* ================================Section: Other feeds===========================   */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 14px 6px",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            <span>Other feeds</span>
            <span style={{ cursor: "pointer", color: "var(--text-secondary)" }}>
              Edit
            </span>
          </div>

          <NavLink
            to="/follow"
            onClick={() => {
              setActiveTab("follow");
            }}
            style={navItemStyle("follow")}
            onMouseEnter={(e) => {
              if (activeTab !== "follow")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "follow")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span
              style={{ width: "21px", textAlign: "center", fontSize: "13px" }}
            >
              <UsersIcon size={20} />
            </span>
            <span>Following</span>
          </NavLink>

          <NavLink
            to="/save"
            onClick={() => {
              setActiveTab("save");
            }}
            style={navItemStyle("save")}
            onMouseEnter={(e) => {
              if (activeTab !== "save")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "save")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <BookmarkIcon size={20} />
            <span>Saved</span>
          </NavLink>

          <NavLink
            to="/like"
            onClick={() => {
              setActiveTab("like");
            }}
            style={{
              ...navItemStyle("like"),
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "like")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "like")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <HeartIcon size={20} />
            <span>Liked</span>
          </NavLink>

          <NavLink
            to="/ghost"
            onClick={() => {
              setActiveTab("ghost");
            }}
            style={{
              ...navItemStyle("ghost"),
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "ghost")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "ghost")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <GhostIcon size={20} />
              <span>Ghost posts</span>
            </div>
          </NavLink>

          <NavLink
            to="/archive"
            onClick={() => {
              setActiveTab("archive");
            }}
            style={navItemStyle("archive")}
            onMouseEnter={(e) => {
              if (activeTab !== "archive")
                e.currentTarget.style.backgroundColor = "var(--bg-pill)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "archive")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ArchiveIcon size={20} />
            <span>Archive</span>
          </NavLink>
        </div>

        {/* Bottom subtle copyright / links */}
        <div
          style={{
            padding: "0 10px",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <span>© 2026 Spool</span>
        </div>
      </aside>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header
        className="threads-mobile-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backgroundColor: "var(--header-bg)",
          borderBottom: "1px solid var(--border-color)",
          height: "56px",
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <button
          onClick={() => setActiveTab("forYou")}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <SpoolLogo size={30} />
          <span
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "var(--text-main)",
            }}
          >
            spool
          </span>
        </button>

        <button
          onClick={toggleTheme}
          style={{ color: "var(--text-secondary)", padding: "6px" }}
        >
          {theme === "dark" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
        </button>
      </header>

      {/* ================= MOBILE BOTTOM DOCK ================= */}
      <nav
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "62px",
          backgroundColor: "var(--header-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-color)",
          display: "none",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 999,
          padding: "0 8px",
        }}
      >
        <button
          onClick={() => setActiveTab("forYou")}
          style={{
            color:
              activeTab === "forYou"
                ? "var(--text-main)"
                : "var(--text-secondary)",
            padding: "10px",
          }}
        >
          <HomeIcon size={24} active={activeTab === "forYou"} />
        </button>
        <button
          onClick={() => setActiveTab("search")}
          style={{
            color:
              activeTab === "search"
                ? "var(--text-main)"
                : "var(--text-secondary)",
            padding: "10px",
          }}
        >
          <SearchIcon size={24} active={activeTab === "search"} />
        </button>
        <button
          onClick={openCreateModal}
          style={{ color: "var(--text-main)", padding: "10px" }}
        >
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>+</span>
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          style={{
            color:
              activeTab === "activity"
                ? "var(--text-main)"
                : "var(--text-secondary)",
            padding: "10px",
          }}
        >
          <HeartIcon size={24} active={activeTab === "activity"} />
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            color:
              activeTab === "profile"
                ? "var(--text-main)"
                : "var(--text-secondary)",
            padding: "10px",
          }}
        >
          <UserIcon size={24} active={activeTab === "profile"} />
        </button>
      </nav>
    </>
  );
};
